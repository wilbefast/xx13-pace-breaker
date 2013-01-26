#! /bin/bash

# arg1: the name of the sprite, ie. 'flic' or 'george'

# make sure everything is 32x32
n=0
for i in $1*.png
do
  new_name=_$1$n.png
  convert $i -background "rgb(255,0,255)" -flatten +matte ${new_name}
  convert ${new_name} -gravity center -extent 32x32 ${new_name} 
  #rm $i
  let n=n+1
done

# build sprite sheet
montage _$1*.png -geometry 32x32+0+0 -tile 3x3 sheet_$1.png

# remove temporary files
rm _$1*.png

# reset background colour transparent
convert sheet_$1.png -transparent "rgb(255,0,255)" sheet_$1.png

