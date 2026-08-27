class Chat extends React.Component {
    state = { user: firebase.auth().currentUser, rooms: [], activeRoomId: '', messages: [], draft: '', roomName: '', inviteEmail: '', error: '', loading: true };

    componentDidMount() {
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) return this.props.changemode('login');
            await firebase.database().ref(`users/${user.uid}`).update({ email: user.email, displayName: user.displayName || user.email, updatedAt: firebase.database.ServerValue.TIMESTAMP });
            this.setState({ user });
            this.subscribeToRooms(user.uid);
        });
    }

    componentWillUnmount() {
        if (this.authUnsubscribe) this.authUnsubscribe();
        if (this.roomsRef) this.roomsRef.off();
        this.unsubscribeFromMessages();
    }

    subscribeToRooms = (uid) => {
        if (this.roomsRef) this.roomsRef.off();
        this.roomsRef = firebase.database().ref(`userRooms/${uid}`);
        this.roomsRef.on('value', async (snapshot) => {
            const roomIds = Object.keys(snapshot.val() || {});
            const roomSnapshots = await Promise.all(roomIds.map((id) => firebase.database().ref(`rooms/${id}`).once('value')));
            const rooms = roomSnapshots.filter((room) => room.exists()).map((room) => ({ id: room.key, ...room.val() }));
            this.setState((previous) => ({ rooms, loading: false, activeRoomId: previous.activeRoomId || (rooms[0] && rooms[0].id) || '' }));
        });
    };

    componentDidUpdate(_, previousState) {
        if (previousState.activeRoomId !== this.state.activeRoomId) this.subscribeToMessages(this.state.activeRoomId);
    }

    unsubscribeFromMessages = () => {
        if (this.messagesRef) this.messagesRef.off();
        this.messagesRef = null;
    };

    subscribeToMessages = (roomId) => {
        this.unsubscribeFromMessages();
        if (!roomId) return this.setState({ messages: [] });
        this.messagesRef = firebase.database().ref(`rooms/${roomId}/messages`).orderByChild('createdAt');
        this.messagesRef.on('value', (snapshot) => {
            const messages = Object.entries(snapshot.val() || {}).map(([id, message]) => ({ id, ...message }));
            this.setState({ messages });
        });
    };

    createRoom = async (event) => {
        event.preventDefault();
        const { user, roomName, inviteEmail } = this.state;
        const recipientEmail = inviteEmail.trim().toLowerCase();
        if (!roomName.trim() || !recipientEmail) return this.setState({ error: '請輸入聊天室名稱與對方的註冊 Email。' });
        if (recipientEmail === user.email.toLowerCase()) return this.setState({ error: '請輸入另一位已註冊使用者的 Email。' });
        try {
            const users = await firebase.database().ref('users').orderByChild('email').equalTo(recipientEmail).once('value');
            const recipient = Object.entries(users.val() || {})[0];
            if (!recipient) throw new Error('找不到該使用者；請確認對方至少登入過一次。');
            const [recipientId, recipientProfile] = recipient;
            const roomRef = firebase.database().ref('rooms').push();
            await roomRef.set({ name: roomName.trim(), createdBy: user.uid, createdAt: firebase.database.ServerValue.TIMESTAMP, members: { [user.uid]: { email: user.email }, [recipientId]: { email: recipientProfile.email } } });
            await firebase.database().ref().update({ [`userRooms/${user.uid}/${roomRef.key}`]: true, [`userRooms/${recipientId}/${roomRef.key}`]: true });
            this.setState({ roomName: '', inviteEmail: '', error: '', activeRoomId: roomRef.key });
        } catch (error) {
            this.setState({ error: error.message || '建立聊天室失敗。' });
        }
    };

    sendMessage = async (event) => {
        event.preventDefault();
        const { user, activeRoomId, draft } = this.state;
        const text = draft.trim();
        if (!text || !activeRoomId) return;
        try {
            await firebase.database().ref(`rooms/${activeRoomId}/messages`).push({ text, senderId: user.uid, senderEmail: user.email, createdAt: firebase.database.ServerValue.TIMESTAMP });
            this.setState({ draft: '' });
        } catch (_) {
            this.setState({ error: '訊息傳送失敗。' });
        }
    };

    render() {
        const { user, rooms, activeRoomId, messages, draft, roomName, inviteEmail, error, loading } = this.state;
        return <main className="container">
            <aside className="discussions">
                <div className="room-title">{user && user.email}</div>
                <form className="room-form" onSubmit={this.createRoom}>
                    <input value={roomName} onChange={(event) => this.setState({ roomName: event.target.value })} placeholder="聊天室名稱" />
                    <input type="email" value={inviteEmail} onChange={(event) => this.setState({ inviteEmail: event.target.value })} placeholder="對方的註冊 Email" />
                    <button className="button1" type="submit">建立私人聊天室</button>
                </form>
                <div className="room-list">{rooms.map((room) => <button key={room.id} className={`room-button ${room.id === activeRoomId ? 'active' : ''}`} onClick={() => this.setState({ activeRoomId: room.id })}>{room.name}</button>)}</div>
                <button className="signout-button" onClick={() => firebase.auth().signOut()}>登出</button>
            </aside>
            <section className="chat">
                {error && <p className="error-message">{error}</p>}
                <div className="messages-chat">
                    {loading && <p>正在載入聊天室…</p>}
                    {!loading && !activeRoomId && <p>建立一個私人聊天室後即可開始聊天。</p>}
                    {messages.map((message) => {
                        const isMine = message.senderId === user.uid;
                        return <article key={message.id} className={`message text-only ${isMine ? 'own-message' : 'incoming-message'}`}><small className="time">{isMine ? '我' : message.senderEmail}</small><p className="text">{message.text}</p></article>;
                    })}
                </div>
                <form className="footer-chat" onSubmit={this.sendMessage}><input className="write-message" value={draft} onChange={(event) => this.setState({ draft: event.target.value })} placeholder="輸入訊息" disabled={!activeRoomId} /><button className="button2" type="submit" disabled={!activeRoomId}>送出</button></form>
            </section>
        </main>;
    }
}

export default Chat;
