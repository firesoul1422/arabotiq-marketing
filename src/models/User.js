const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  company: {
    name: String,
    size: String,
    industry: String,
    location: String,
    description: String
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar' // Arabic as default language
  },
  products: [{
    name: String,
    description: String,
    category: String,
    targetAudience: String,
    uniqueSellingPoints: [String]
  }],
  socialMediaCredentials: [{
    platform: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'pinterest', 'tiktok-arabia', 'linkedin-mena', 'other']
    },
    accountName: String,
    accountUrl: String,
    apiKey: String,
    apiSecret: String,
    accessToken: String,
    accessTokenSecret: String
  }],
  analyticsCredentials: {
    googleAnalytics: {
      id: String,
      active: {
        type: Boolean,
        default: false
      },
      lastVerified: Date
    }
  },
  subscription: {
    tier: {
      type: String,
      enum: ['basic', 'pro', 'enterprise'],
      default: 'basic'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected'],
      default: 'pending'
    },
    accessUrl: {
      type: String,
      unique: true
    },
    accessUrlExpiry: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    contactInfo: {
      phone: String,
      whatsapp: String,
      preferredContact: {
        type: String,
        enum: ['phone', 'whatsapp', 'email'],
        default: 'email'
      }
    }
  },
  socialAccounts: {
    count: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 5 // Basic tier limit
    }
  },
  campaignsThisMonth: {
    count: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 10 // Basic tier limit
    }
  },
  preferences: {
    rtlLayout: {
      type: Boolean,
      default: true // RTL layout by default for Arabic
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    dialect: {
      type: String,
      enum: ['msa', 'gulf', 'levantine', 'egyptian'],
      default: 'msa' // Modern Standard Arabic by default
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }],
  isOwner: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Update the updatedAt field
  user.updatedAt = Date.now();
  
  // Only hash the password if it's modified
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  
  // Update subscription limits based on tier
  if (user.isModified('subscription.tier')) {
    switch(user.subscription.tier) {
      case 'basic':
        user.socialAccounts.limit = 5;
        user.campaignsThisMonth.limit = 10;
        break;
      case 'pro':
        user.socialAccounts.limit = 15;
        user.campaignsThisMonth.limit = 0; // Unlimited
        break;
      case 'enterprise':
        user.socialAccounts.limit = 50;
        user.campaignsThisMonth.limit = 0; // Unlimited
        break;
    }
  }
  
  next();
});

// Check if user has an active subscription
userSchema.methods.hasActiveSubscription = function() {
  // If subscription status is active, return true
  if (this.subscription.status === 'active') {
    return true;
  }
  
  // If subscription is in trial mode, return true
  if (this.subscription.status === 'trial') {
    return true;
  }
  
  // If subscription has an end date and it's in the future, return true
  if (this.subscription.endDate && new Date(this.subscription.endDate) > new Date()) {
    return true;
  }
  
  return false;
};

// Generate JWT token with expiration tied to billing cycle
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  
  // Calculate token expiration based on subscription end date
  const expiresAt = user.subscription.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
  
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor((expiresAt - Date.now()) / 1000) }
  );
  
  // Store token in user document
  user.tokens = user.tokens.filter(tokenObj => new Date(tokenObj.expiresAt) > new Date());
  user.tokens.push({ token, expiresAt });
  await user.save();
  
  return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid login credentials');
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }
  
  return user;
};

// Check if user's subscription is active
userSchema.methods.hasActiveSubscription = function() {
  const user = this;
  
  if (user.subscription.status !== 'active') {
    return false;
  }
  
  if (user.subscription.endDate && new Date(user.subscription.endDate) < new Date()) {
    return false;
  }
  
  return true;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.tokens;
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;