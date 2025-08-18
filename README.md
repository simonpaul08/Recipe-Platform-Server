# Recipe Portal (Server)

# Installation
Clone the repo and install the dependencies(if any).

```bash
npm install
```

# Environment Variables 
Create a `.env` file in the root and declare the following variables with appropritae values, check .env.example file for reference

```bash
PORT=your_port
DATABASE_URL=sqlitedb_url
JWT_SECRET=your_secret
NODE_ENV=development
```

# Setup DB
Use the commands below to setup the db
```bash
npm run db:generate

npm run db:migrate
```

# Seed Dummy Values
Use the command below to run the seed script
```bash
npm run seed
```

# Run Command 
Use the command below to run the server
```bash
npm run dev
```
