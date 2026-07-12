import { useSocket } from '../context/SocketProvider'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import peer from '../service/peer'
function Room() {

    const navigate = useNavigate()
    const socket = useSocket()
    const [remoteSocketId, setRemoteSocketId] = useState()
    const [remoteSocketName, setRemoteSocketName] = useState(null)
    const [remoteStream, setRemoteStream] = useState()
    const [myStream, setMyStream] = useState()
    // const [socketName, setSocketName] = useState(null)

    // const handleUserName = useCallback((data) => {

    //     console.log(data);
    //     const {User} = data
    //     console.log("NAME:", User);
    //     if (User) { // Check if User is defined before setting state
    //         setSocketName(User);
    //     } else {
    //         console.warn("User property not found in 'Name:Send' payload.");
    //     }
    // }, [setSocketName])


    const handleUserJoined = useCallback(async ({ name, id }) => {
        console.log("New User Joined", name, id);
        localStorage.setItem("USER", name)
        setRemoteSocketId(id)
        setRemoteSocketName(name)
    }, [])


    const videoRef = useRef(null)
    useEffect(() => {

        if (videoRef.current && myStream) {
            videoRef.current.srcObject = myStream;
        }
    }, [myStream]);


    const handleCallBtn = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        setMyStream(stream)
        stream.getTracks().forEach(track => {
            peer.peer.addTrack(track, stream);
        });
        const offer = await peer.getOffer()
        socket.emit("User:Call", { to: remoteSocketId, offer })

    }, [socket, remoteSocketId])


    const handleIncomingCall = useCallback(async ({ from, offer, name }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);

        stream.getTracks().forEach(track => {
            peer.peer.addTrack(track, stream);
        });

        const ans = await peer.getAnswer(offer);
        socket.emit("Accepted:Call", { to: from, ans, name });
    }, [socket]);


    const handleAcceptedCall = useCallback(async ({ from, ans }) => {
        await peer.setLocalDescriptions(ans)
        console.log("Call Accepted!!");

    }, [])

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer()
        socket.emit("Peer:Nego:Needed", { to: remoteSocketId, offer })
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener("negoNeeded", handleNegoNeeded)
        return () => {
            peer.peer.removeEventListener("negoNeeded", handleNegoNeeded)
        }
    }, [handleNegoNeeded])

    const handlePeerNegoIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer)
        socket.emit("Peer:Nego:Done", { to: from, ans })
    }, [socket])

    const handlePeerNegoFinal = useCallback(async ({ from, ans }) => {
        await peer.setLocalDescriptions(ans)
    }, [])

    const remoteRef = useRef(null)

    useEffect(() => {
        if (remoteStream) {
            console.log("Setting remote stream with tracks:", remoteStream.getTracks());
        }
        if (remoteRef.current && remoteStream) {
            remoteRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);



    useEffect(() => {
        handleCallBtn()
        console.log("Registering 'Name:Send' listener");
        // socket.on("Name:Send", handleUserName)
        socket.on("User:Joined", handleUserJoined)
        socket.on("Incoming:Call", handleIncomingCall)
        socket.on("Accepted:Call", handleAcceptedCall)
        socket.on("Peer:Nego:Needed", handlePeerNegoIncoming)
        socket.on("Peer:Nego:Final", handlePeerNegoFinal)
        return () => {
            // socket.off("Name:Send", handleUserName)  
            socket.off("User:Joined", handleUserJoined)
            socket.off("Incoming:Call", handleIncomingCall)
            socket.off("Accepted:Call", handleAcceptedCall)
            socket.off("Peer:Nego:Needed", handlePeerNegoIncoming)
            socket.off("Peer:Nego:Final", handlePeerNegoFinal)
        }

    }, [socket, handleUserJoined, handleIncomingCall, handleAcceptedCall, handlePeerNegoIncoming, handlePeerNegoFinal,])


    const handleEndCallBtn = useCallback(() => {
        socket.emit("Call:Ended", { to: remoteSocketId })
        if (videoRef.current && videoRef.current.srcObject) {
            // Call getTracks() on the MediaStream object
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null; // Clear the stream from the video element
        }
        console.log("Call END!");

        if (peer.peer) {
            peer.peer.getSenders().forEach(sender => sender.track?.stop());
            peer.peer.close();
        }
        peer.resetPeer()
        localStorage.clear()
        navigate("/")

    }, [remoteSocketId, videoRef])

    const [callEndedMess, setCallEndedMess] = useState('')

    const handleCallEndedNoti = useCallback(({ mes }) => {
        setCallEndedMess(mes)
    }, [setCallEndedMess])

    useEffect(() => {
        socket.on("Call:Ended:Noti", handleCallEndedNoti)
        return () => {
            socket.off("Call:Ended:Noti", handleCallEndedNoti)
        }
    }, [handleCallEndedNoti])
    const handleBackBtn = () => {

        if (peer.peer) {
            peer.peer.getSenders().forEach(sender => sender.track?.stop());
            peer.peer.close();
        }
        peer.resetPeer()
        navigate("/")
        localStorage.clear()

    }
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);

    const handleMuteVideobtn = () => {
        let videoTrack = myStream?.getTracks().find(track => track.kind === "video");
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    };

    const handleMuteAudioBtn = () => {
        let audioTrack = myStream?.getTracks().find(track => track.kind === "audio");
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    };

    const buttonStyle = (active, activeColors, inactiveColors) => ({
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        background: active
            ? `linear-gradient(45deg, ${activeColors[0]}, ${activeColors[1]})`
            : `linear-gradient(45deg, ${inactiveColors[0]}, ${inactiveColors[1]})`,
        color: "white",
        fontSize: "16px",
        cursor: "pointer",
        transition: "transform 0.2s ease, background 0.3s ease",
        fontWeight: "bold",
        margin: "0 5px"
    });

    const overlayStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: "50%",
        padding: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    };

    const videoContainerStyle = {
        position: "relative",
        border: "4px solid transparent",
        borderImage: "linear-gradient(45deg, #ff6ec4, #7873f5) 1",
        borderRadius: "10px",
        overflow: "hidden",
        width: "400px",
        height: "250px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            {/* Back Button */}
            <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1000 }}>
                <button
                    onClick={handleBackBtn}
                    style={buttonStyle(true, ["#ff6ec4", "#7873f5"], ["#444", "#777"])}
                >
                    {"<< BACK"}
                </button>
            </div>

            {/* Header */}
            <h2 style={{ color: "#444" }}>{callEndedMess}</h2>
            <h1 style={{ marginBottom: "10px" }}>
                WELCOME TO ROOM ({localStorage.getItem("ROOM NO.")})
            </h1>
            <h2 style={{ textTransform: "uppercase", color: "#555" }}>
                {remoteSocketId
                    ? `✅ '${remoteSocketName}' CONNECTED`
                    : "NO ONE IN ROOM"}
            </h2>

            {/* Call Button */}
            {remoteSocketId && (
                <button
                    onClick={handleCallBtn}
                    style={buttonStyle(true, ["#83e92f", "#2f7f44"], ["#444", "#777"])}
                >
                    📞 CALL
                </button>
            )}

            {/* Streams */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                marginTop: "20px",
                flexWrap: "wrap"
            }}>
                {/* My Stream */}
                {myStream && (
                    <div style={videoContainerStyle}>
                        <h3 style={{ color: "#ffffffff", marginBottom: "2px" }}>MY STREAM</h3>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {!isVideoOn && (
                            <div style={overlayStyle}>
                                <span style={{ fontSize: "32px", color: "white" }}>🚫</span>
                            </div>
                        )}
                        {!isAudioOn && (
                            <div style={{ ...overlayStyle, top: "auto", bottom: "10px", left: "50%" }}>
                                <span style={{ fontSize: "24px", color: "white" }}>🎤🚫</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Remote Stream */}
                {remoteStream && (
                    <div style={{
                        ...videoContainerStyle,
                        borderImage: "linear-gradient(45deg, #00c6ff, #0072ff) 1"
                    }}>
                        <h3 style={{ color: "#fff", marginBottom: "5px" }}>REMOTE STREAM</h3>
                        <video
                            ref={remoteRef}
                            autoPlay
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ marginTop: "20px" }}>
                {myStream && (
                    <>
                        <button
                            onClick={handleMuteVideobtn}
                            style={buttonStyle(isVideoOn, ["#ff6ec4", "#7873f5"], ["#444", "#777"])}
                        >
                            {isVideoOn ? "Disable Video" : "Enable Video"}
                        </button>
                        <button
                            onClick={handleMuteAudioBtn}
                            style={buttonStyle(isAudioOn, ["#da1414", "#e76464"], ["#444", "#777"])}
                        >
                            {isAudioOn ? "Mute Audio" : "Unmute Audio"}
                        </button>
                    </>
                )}

                {remoteStream && (
                    <button
                        onClick={handleEndCallBtn}
                        style={buttonStyle(true, ["#da1414", "#e76464"], ["#444", "#777"])}
                    >
                        ❌ END CALL
                    </button>
                )}
            </div>
        </div>
    );
}

export default Room