class VoiceChatService {
  constructor() {
    this.localStream = null;
    this.peers = new Map(); // socketId -> RTCPeerConnection
    this.remoteStreams = new Map(); // socketId -> MediaStream
    this.isMuted = false;
    this.isEnabled = false;
    this.onPeersUpdate = null;
    this.socket = null;
    this._signalListenerAttached = false;
  }

  init(socket, onPeersUpdate) {
    this.socket = socket;
    this.onPeersUpdate = onPeersUpdate;

    if (!this._signalListenerAttached && this.socket) {
      this.socket.on('voice_signal', async ({ fromSocketId, signal }) => {
        await this._handleSignal(fromSocketId, signal);
      });
      this._signalListenerAttached = true;
    }
  }

  async startVoice(roomPlayers, myUserId) {
    try {
      if (!this.localStream) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });
      }

      this.isEnabled = true;
      this.isMuted = false;
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = true;
      });

      // Connect to other players in room
      await this.syncPeers(roomPlayers, myUserId);

      return { success: true };
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      return { success: false, error: err.message };
    }
  }

  async syncPeers(roomPlayers, myUserId) {
    if (!this.isEnabled || !this.localStream || !roomPlayers) return;

    const otherPlayers = roomPlayers.filter(p => p.id !== myUserId && p.socketId);
    for (const peer of otherPlayers) {
      if (!this.peers.has(peer.socketId)) {
        await this._initiatePeerConnection(peer.socketId, true);
      }
    }
  }

  async _initiatePeerConnection(remoteSocketId, isInitiator) {
    if (this.peers.has(remoteSocketId)) {
      return this.peers.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peers.set(remoteSocketId, pc);

    // Add local mic tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        try {
          pc.addTrack(track, this.localStream);
        } catch (e) {
          // Track already added or renegotiating
        }
      });
    }

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('voice_signal', {
          toSocketId: remoteSocketId,
          signal: { candidate: event.candidate }
        });
      }
    };

    // Receive remote audio stream
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      this.remoteStreams.set(remoteSocketId, stream);

      // Play audio element
      const audioEl = new Audio();
      audioEl.srcObject = stream;
      audioEl.play().catch(e => console.log('Autoplay audio blocked:', e));

      if (this.onPeersUpdate) this.onPeersUpdate();
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('voice_signal', {
        toSocketId: remoteSocketId,
        signal: { offer }
      });
    }

    return pc;
  }

  async _handleSignal(fromSocketId, signal) {
    let pc = this.peers.get(fromSocketId);
    if (!pc) {
      pc = await this._initiatePeerConnection(fromSocketId, false);
    }

    if (signal.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit('voice_signal', {
        toSocketId: fromSocketId,
        signal: { answer }
      });
    } else if (signal.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
    } else if (signal.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      } catch (e) {
        // Candidate arrival race condition
      }
    }
  }

  toggleMute(roomCode) {
    if (!this.localStream) return false;
    this.isMuted = !this.isMuted;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !this.isMuted;
    });

    if (this.socket && roomCode) {
      this.socket.emit('voice_status', { roomCode, isMuted: this.isMuted });
    }
    return this.isMuted;
  }

  leaveVoice() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    for (const [, pc] of this.peers) {
      pc.close();
    }
    this.peers.clear();
    this.remoteStreams.clear();
    this.isEnabled = false;
    this.isMuted = false;
  }
}

export const voiceChatService = new VoiceChatService();
