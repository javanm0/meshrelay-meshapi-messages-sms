require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3060;

const uri = process.env.MONGODB_URI;

const SMSSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  node_id: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  phoneNumber: {
    type: String,
    required: false
  },
  messageSent: {
    type: Boolean,
    default: false
  }
});

const SMS = mongoose.models.SMS || mongoose.model('SMS', SMSSchema);

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to the database');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

app.use(express.json());

// Endpoint to retrieve SMS messages
app.get('/api/sms', async (req, res) => {
  try {
    await connectToDatabase();
    const SMSs = await SMS.find({ messageSent: false });
    console.log('Successfully fetched SMS messages:', SMSs);
    res.json(SMSs);
  } catch (error) {
    console.error('Error fetching SMS messages:', error);
    res.status(500).json({ error: 'Failed to fetch SMS messages' });
  }
});

// Endpoint to update the SMSSent field of an SMS message
app.put('/api/sms', async (req, res) => {
  const { id } = req.body;

  try {
    await connectToDatabase();
    console.log(`Attempting to update SMS with ID: ${id}`);
    const result = await SMS.updateOne({ _id: id }, { $set: { messageSent: true } });

    if (result.modifiedCount === 0) {
      console.log(`SMS with ID ${id} not found or already updated`);
      return res.status(404).json({ error: 'SMS not found or already updated' });
    }

    // Re-fetch the SMS to ensure the update is applied
    const updatedSMS = await SMS.findById(id);
    console.log('Re-fetched updated SMS:', updatedSMS);

    // Check if the messageSent field is updated
    if (updatedSMS && updatedSMS.messageSent) {
      console.log('SMS sent field updated successfully');
      res.json({ message: 'SMS updated successfully', data: updatedSMS });
    } else {
      console.log('Failed to update SMS sent field');
      res.status(500).json({ error: 'Failed to update SMS sent field' });
    }
  } catch (error) {
    console.error('Error updating SMS:', error);
    res.status(500).json({ error: 'Error updating SMS' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});