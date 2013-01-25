//! ----------------------------------------------------------------------------
//! CONSTRUCTOR
//! ----------------------------------------------------------------------------

function V2(_x, _y)
{
  this.x = (_x || 0);
  this.y = (_y || 0);
}

//! ----------------------------------------------------------------------------
//! PROTOTYPE
//! ----------------------------------------------------------------------------

V2.prototype.norm = function()
{
  if(this.x == 0)
    return Math.abs(this.y);
  else if(this.y == 0)
    return Math.abs(this.x);
  else
    return Math.sqrt(this.x*this.x + this.y*this.y);
}

V2.prototype.norm2 = function()
{
  return (this.x*this.x + this.y*this.y);
}

// setters

V2.prototype.randomDir = function()
{
  this.x = Math.random() - Math.random();
  this.y = Math.random() - Math.random();
  this.normalise();
  return this;
}

V2.prototype.setXY = function(x, y)
{
  this.x = x;
  this.y = y;
  return this;
}

V2.prototype.setV2 = function(v)
{
  this.x = v.x;
  this.y = v.y;
  return this;
}

V2.prototype.setFromTo = function(v, w)
{
  if(v.x == w.x && v.y == w.y)
    this.randomDir();
  else
  {
    this.x = w.x - v.x;
    this.y = w.y - v.y;
  }
  return this;
}

V2.prototype.setNorm = function(new_norm)
{
  if(new_norm <= 0.0)
    this.x = this.y = 0.0;
  else
  {
    this.normalise();
    this.x *= new_norm;
    this.y *= new_norm;
  }
  return this;
}

// modification
V2.prototype.ninety_left = function()
{
  this.x = this.y;
  this.y = -this.x;
  return this;
}

V2.prototype.ninety_right = function()
{
  this.x = -this.y;
  this.y = this.x;
  return this;
}

V2.prototype.addXY = function(x, y)
{
  this.x += x;
  this.y += y;
  return this;
}

V2.prototype.addV2 = function(v)
{
  this.x += v.x;
  this.y += v.y;
  return this;
}

V2.prototype.subV2 = function(v)
{
  this.x -= v.x;
  this.y -= v.y;
  return this;
} 

V2.prototype.scale = function(amount)
{
  this.x *= amount;
  this.y *= amount;
  return this;
}

V2.prototype.scaleV2 = function(v)
{
  this.x *= v.x;
  this.y *= v.y;
  return this;
}

V2.prototype.inverse = function()
{
  this.x = 1.0 / this.x;
  this.y = 1.0 / this.y;
  return this;
}

V2.prototype.addNorm = function(amount)
{
  this.setNorm(norm + amount);
  return this;
}

V2.prototype.normalise = function()
{
  var norm = this.norm();
  
  var norm_inv = 1.0 / norm;
  this.x *= norm_inv;
  this.y *= norm_inv;
  
  return norm;
}

V2.prototype.addAngle = function(theta)
{
  var cos_theta = Math.cos(theta),
      sin_theta = Math.sin(theta);
  this.x = this.x * cos_theta - this.y * sin_theta;
  this.y = this.x * sin_theta + this.y * cos_theta;
  return this;
}

// mathematics
V2.prototype.dot = function(other)
{
  return (this.x * other.x + this.y * other.y);
} 

V2.prototype.det = function(other)
{
  return (this.x * other.y - this.y * other.x);
}

V2.prototype.dist2 = function(other)
{
  var dx = other.x - this.x, 
      dy = other.y - this.y;
      
  return (dx*dx + dy*dy);
}

V2.prototype.dist = function(other)
{
  var dx = other.x - this.x, 
      dy = other.y - this.y;
      
  return Math.sqrt(dx*dx + dy*dy);
}

V2.prototype.isColine = function(other)
{
  return (this.dot(other) == this.norm() * other.norm());
}
