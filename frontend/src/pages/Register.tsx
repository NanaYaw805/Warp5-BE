import React, {useState} from 'react'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  function submit(e:any){
    e.preventDefault()
    alert('Register is mocked — use user@example.com / password to login')
  }
  return (
    <form onSubmit={submit} style={{maxWidth:400}}>
      <h2>Register</h2>
      <div>
        <label>Email</label><br/>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
      </div>
      <div style={{marginTop:8}}>
        <label>Password</label><br/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
      </div>
      <button type="submit" style={{marginTop:12}}>Register</button>
    </form>
  )
}
