import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { requestFactory, SwordRequester } from './api/request';
import { refreshSession } from './api/user';
import './App.css';
import Header from './components/header/Header';
import LoginForm from './components/loginform/LoginForm';
import Tasks from './components/tasks/Tasks';
import { User } from './model/model';

function App() {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const requester: SwordRequester = useMemo(() => requestFactory((code: number) => {

    if (code === 401) { setUser(null) }

  }), [])

  const unsetUser = useCallback(() => setUser(null), [])

  useEffect(() => {

    refreshSession(requester)
      .then(({ user } : { user: User }) => {
        setUser(user)
      })
      .catch(err => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [requester])


  return (
    <div className="App">
        {!loading ?
        <>
        <Header user={user} onLogout={unsetUser} requester={requester} />
        <main>
            {user === null ? <LoginForm requester={requester} onSuccess={setUser} /> : <Tasks user={user} requester={requester} /> }
        </main>
      </>
      : null }
    </div>
  );
}

export default App;
