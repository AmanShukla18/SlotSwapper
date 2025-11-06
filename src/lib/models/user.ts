
import bcrypt from 'bcryptjs';

const isEdge = typeof process !== 'undefined' && process.env && process.env.NEXT_RUNTIME === 'edge';

let mongoose: any = undefined;
if (!isEdge) {
  
  try {
    
    mongoose = require('mongoose');
  } catch (err) {
    mongoose = undefined;
  }
}


let DefaultUser: any = {};

if (mongoose) {
  const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: 'Please enter a valid email'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    avatarUrl: {
      type: String,
      default: function(this: any) {
        return `https://picsum.photos/seed/${this._id}/40/40`;
      }
    }
  }, {
    timestamps: true
  });

  
  userSchema.pre('save', async function(this: any, next: any) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });

 
  userSchema.methods.comparePassword = async function(this: any, candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  DefaultUser = (mongoose.models && mongoose.models.User) ? mongoose.models.User : mongoose.model('User', userSchema);
} else {
  
  DefaultUser = {};
}

export default DefaultUser;