const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const cors = require('cors')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'sample.db',
  define: {
    timestamps: false
  }
})

const Ship = sequelize.define('ship', {
  id:{type : Sequelize.INTEGER,
            primaryKey : true,} ,
  nume: Sequelize.STRING(3),
  displacement: Sequelize.INTEGER(50)
})

const CrewMember = sequelize.define('crewmember', {
  id: {type : Sequelize.INTEGER,
    primaryKey : true,} ,
  nume: Sequelize.STRING(5),
  rol: Sequelize.STRING(20)
})

Ship.hasMany(CrewMember)

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).json({ message: 'created' })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/ships', async (req, res) => {
  try {
    if (req.query.bulk && req.query.bulk === 'on') {
      await Ship.bulkCreate(req.body)
      res.status(201).json({ message: 'created' })
    } else {
      await Ship.create(req.body)
      res.status(201).json({ message: 'created' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id)
    if (ship) {
      res.status(200).json(ship)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/ships/:id', async (req, res) => {
    try {
        const ship = await Ship.findByPk(req.params.id)
      if (ship) {
        await Ship.bulkCreate(req.body)
        res.status(201).json({ message: 'created' })
      } else {
        await Ship.create(req.body)
        res.status(201).json({ message: 'created' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

app.put('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id)
    if (ship) {
      await ship.update(req.body, { fields: ['nume', 'displacement'] })
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/ships/:id', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.id, { include: CrewMember })
    if (ship) {
      await ship.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/ships/:bid/crewmembers', async (req, res) => {
    try {
      const ship = await Ship.findByPk(req.params.bid)
      if (ship) {
        const crewmembers = await ship.getCrewMembers()
        res.status(200).json(crewmembers)
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })

app.get('/ships/:bid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.bid)
    if (ship) {
      const crewmembers = await ship.getCrewMembers({ where: { id: req.params.cid } })
      res.status(200).json(crewmembers.shift())
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post('/ships/:bid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.bid)
    if (ship) {
      const crewmembers = await ship.getCrewMembers({ where: { id: req.params.cid } })
      crewmembers.shipId = ship.id
      console.warn(crewmembers)
      await Chapter.create(crewmembers)
      res.status(201).json({ message: 'created' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/ships/:bid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.bid)
    if (ship) {
      const crewmembers = await ship.getCrewMembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.update(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/ships/:bid/crewmembers/:cid', async (req, res) => {
  try {
    const ship = await Ship.findByPk(req.params.bid)
    if (ship) {
      const crewmembers = await ship.getCrewMembers({ where: { id: req.params.cid } })
      const crewmember = crewmembers.shift()
      if (crewmember) {
        await crewmember.destroy(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.listen(8080)