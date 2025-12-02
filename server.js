import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Inicialização
const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors()); // Permite que o seu frontend (em outra porta) acesse esta API
app.use(express.json()); // Permite que o servidor entenda JSON

const PORT = 3001; // Porta onde a API vai rodar

// Rota raiz para health check
app.get('/', (req, res) => {
    res.json({ message: 'Fortinat-shop API está no ar! 🚀' });
});

// --- ROTAS DA API ---

// Rota de Registro
app.post('/api/register', async(req, res) => {
    const { email, name, password } = req.body;
    try {
        const user = await prisma.user.create({
            data: { email, name, password },
        });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Usuário já existe ou dados inválidos.' });
    }
});

// Rota de Login
app.post('/api/login', async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        if (user.password !== password) {
            // Em um app real, use bcrypt para comparar senhas com hash
            return res.status(401).json({ message: 'Senha incorreta.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Rota para buscar um usuário (usado para refresh)
app.get('/api/user/:email', async(req, res) => {
    const { email } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});

// Rota para Compra
app.post('/api/buy', async(req, res) => {
    const { userId, item } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.balance < item.price) {
            return res.status(400).json({ message: 'Saldo insuficiente ou usuário não encontrado.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                balance: { decrement: item.price },
                inventory: { push: item.id },
                history: {
                    push: {
                        id: crypto.randomUUID(),
                        date: new Date().toISOString(),
                        type: 'PURCHASE',
                        amount: -item.price,
                        cosmeticId: item.id,
                        cosmeticName: item.name,
                        cosmeticImage: item.image,
                    },
                },
            },
        });
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao processar a compra.' });
    }
});

// Rota para buscar todos os usuários para a página Comunidade
app.get('/api/users', async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            // Seleciona apenas os campos necessários para evitar expor dados sensíveis
            select: {
                id: true,
                name: true,
                inventory: true,
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
});

// Rota para Reembolso
app.post('/api/refund', async(req, res) => {
    // Implementação simplificada. Uma real buscaria o preço original no histórico.
    const { userId, itemId, amount } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                balance: { increment: amount },
                inventory: { set: (await prisma.user.findUnique({ where: { id: userId } })).inventory.filter(id => id !== itemId) },
            },
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar reembolso.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor da API rodando em http://localhost:${PORT}`);
});