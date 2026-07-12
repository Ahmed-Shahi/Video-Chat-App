import { useState } from 'react'
import { useCallback } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
function Lobby() {
    const [name, setName] = useState("")
    const [room, setRoom] = useState('')
    const navigate = useNavigate()
    const socket = useSocket();
    // console.log(socket);

    const handleJoinRoom =  ({ name, room }) => {
        console.log(name, room, socket.id);
        navigate(`/room/${room}`)
    }

    useEffect(() => {
        socket.on("Join:Room", handleJoinRoom)
        return () => {
            socket.off("Join:Room", handleJoinRoom)
        }
    }, [socket, handleJoinRoom])

    const handleJoinBtn = useCallback((e) => {
        e.preventDefault();
        console.log(socket.id);
        
        if (!localStorage.getItem("HOST")) {
            localStorage.setItem("HOST", name);
        }
        localStorage.setItem("ROOM NO.", room)
        
        socket.emit("Join:Room", { name, room })
        // socket.emit("User:Name",{User : name, id: socket.id})

    }, [name, room, socket])

    return (
        <>
            <form
                onSubmit={handleJoinBtn}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '30px',
                    border: '5px solid',
                    borderImage: 'linear-gradient(45deg, #00c6ff, #0072ff) 1',
                    borderRadius: '15px',
                    width: '350px',
                    margin: '40px auto',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
            >
                <h2 style={{ marginBottom: '10px' }}>START VIDEO CHAT</h2>

                <input
                    required
                    type="text"
                    placeholder="ENTER FULL NAME"
                    onChange={(e) => {
                        setName(e.target.value)

                    }}
                    value={name}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />

                <input
                    required
                    type="number"
                    placeholder="ENTER ROOM NO"
                    onChange={(e) => setRoom(e.target.value)}
                    value={room}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(45deg, #ff6ec4, #7873f5)',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    JOIN
                </button>
            </form>

        </>
    )
}

export default Lobby
