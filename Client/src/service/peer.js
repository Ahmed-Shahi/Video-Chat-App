class PeerService {
  constructor() {
    this.createPeer();
  }

  createPeer() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer)
      const ans = await this.peer.createAnswer()
      await this.peer.setLocalDescription(new RTCSessionDescription(ans))
      return ans;

    }
  }
  async setLocalDescriptions(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
    }
  }
  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer()
      await this.peer.setLocalDescription(new RTCSessionDescription(offer))
      return offer
    }
  }

  resetPeer() {
    if (this.peer) {
      try {
        this.peer.close();
      } catch (e) {
        console.warn("Peer already closed");
      }
    }
    this.createPeer();
  }
}

export default new PeerService();