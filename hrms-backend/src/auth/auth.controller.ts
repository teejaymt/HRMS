import { Controller, Post, Body, Get, Res, Param, Patch, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('register')
  getRegisterForm(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Register</title></head>
      <body>
        <h2>Register New User</h2>
        <form id="registerForm">
          <div>
            <label>Email: <input type="email" id="email" required /></label>
          </div>
          <div>
            <label>Password: <input type="password" id="password" required /></label>
          </div>
          <div>
            <label>Role: 
              <select id="role">
                <option value="EMPLOYEE">Employee</option>
                <option value="HR">HR</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </div>
          <button type="submit">Register</button>
        </form>
        <div id="result"></div>
        <script>
          document.getElementById('registerForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const response = await fetch('/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, role })
            });
            
            const data = await response.json();
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          };
        </script>
      </body>
      </html>
    `);
  }

  @Get('login')
  getLoginForm(@Res() res: Response) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Login</title></head>
      <body>
        <h2>Login</h2>
        <form id="loginForm">
          <div>
            <label>Email: <input type="email" id="email" required /></label>
          </div>
          <div>
            <label>Password: <input type="password" id="password" required /></label>
          </div>
          <button type="submit">Login</button>
        </form>
        <div id="result"></div>
        <script>
          document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const response = await fetch('/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            document.getElementById('result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          };
        </script>
      </body>
      </html>
    `);
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role?: string,
  ) {
    return this.authService.register(email, password, role);
  }

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { email?: string; role?: string; isActive?: boolean; password?: string },
  ) {
    return this.authService.update(+id, updateData);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Patch('users/:id/toggle-active')
  async toggleUserActive(@Param('id') id: string) {
    return this.authService.toggleActive(+id);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}
