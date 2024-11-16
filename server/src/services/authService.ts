import fs from 'fs';
import path from 'path';

interface User {
  username: string;
  password: string;
}

class AuthService {
  private users: User[];

  constructor() {
    // Read users from users.json
    const usersData = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8');
    this.users = JSON.parse(usersData).users;
  }

  authenticateUser(username: string, password: string): boolean {
    const user = this.users.find(u => 
      u.username === username && u.password === password
    );
    return !!user;
  }
}

export default new AuthService(); 