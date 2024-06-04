import fs from 'fs';
import path from 'path';
import { JSONFilePreset } from 'lowdb/node';

const DB_DIR = './src/db';
const DB_FILENAME = 'database.json';
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}

const defaultData = { users: [] };
const db = await JSONFilePreset(path.join(DB_DIR, DB_FILENAME), defaultData);

if (db.data.users.length === 0) {
  db.data = {
    users: [
      {
        userid: 'demo@demo.com',
        password: '$2b$10$vAHod8dMNe/Dqb74gRfGe.f1rSp2ee7.eXDPcnlIq/dwHzWNxj5ke', // "demo"
      },
    ],
  };
  await db.write();
}

const getUserByUserId = (userid) => db.data.users.find((user) => user.userid === userid);

const addUser = async (user) => {
  await db.update(({ users }) => users.push(user));
};

const deleteUser = async (userid) => {
  await db.update(({ users }) => users.filter((user) => user.userid !== userid));
};

const addPurchase = async (userid, purchase) => {
  const user = db.data.users.find((u) => u.userid === userid);
  if (!user?.purchases) {
    user.purchases = [];
  }
  user.purchases.push({
    id: user.purchases.length + 1,
    date: Date.now(),
    dateISO: new Date().toISOString(),
    info: purchase,
  });
  await db.write();
};

// eslint-disable-next-line
const resetDB = async () => {
  db.data = defaultData;
  await db.write();
};

const dbService = {
  getUserByUserId,
  addUser,
  deleteUser,
  addPurchase,
};
export default dbService;
