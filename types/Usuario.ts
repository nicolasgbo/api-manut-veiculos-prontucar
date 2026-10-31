//Formato de um usuario como ele vem do banco tabela usuarios.
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  //Hash bcrypt da senha. A senha em texto puro nunca e guardada.
  senhaHash: string;
}
