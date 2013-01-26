#! /bin/bash

# arg1: the name of the sprite, ie. 'flic' or 'george'

# make sure everything is 32x32
n=0
for i in $1*.png
do
  new_name=$1$n.png
  convert $i -background "rgb(255,0,255)" -flatten +matte $i
  convert $i -gravity center -extent 32x32 ${new_name}
  #rm $i
  let n=n+1
done

# build sprite sheet
montage $1*.png -geometry 32x32+0+0 -tile 3x3 $1.png
rm $1?*.png

# reset background colour transparent
convert $1.png -transparent "rgb(255,0,255)" $1.png

