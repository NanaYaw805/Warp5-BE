export async function mockLogin(email:string,password:string){
  // demo credentials
  return email === 'user@example.com' && password === 'password'
}

export async function fetchResources(){
  return [
    { id: 1, name: 'Resource A', description: 'Demo resource A' },
    { id: 2, name: 'Resource B', description: 'Demo resource B' }
  ]
}
