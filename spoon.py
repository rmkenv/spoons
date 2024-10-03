import streamlit as st
from PIL import Image, ImageDraw
import io

def create_bowl(draw, shape, x, y, width, height):
  if shape == "Round":
      draw.ellipse([x, y, x + width, y + height], outline="black")
  elif shape == "Pointed":
      draw.polygon([(x, y + height), (x + width // 2, y), (x + width, y + height)], outline="black")
  elif shape == "Square":
      draw.rectangle([x, y, x + width, y + height], outline="black")

def create_handle(draw, shape, x, y, width, height):
  if shape == "Straight":
      draw.line([(x, y), (x, y + height)], fill="black")
      draw.line([(x + width, y), (x + width, y + height)], fill="black")
  elif shape == "Curved":
      draw.arc([x - width, y, x + width * 2, y + height], 0, 180, fill="black")
      draw.arc([x, y, x + width, y + height], 180, 0, fill="black")
  elif shape == "Tapered":
      draw.line([(x, y), (x + width // 4, y + height)], fill="black")
      draw.line([(x + width, y), (x + width * 3 // 4, y + height)], fill="black")

def create_spoon_image(bowl_shape, handle_shape, bowl_width, bowl_height, handle_width, handle_height):
  image_width = max(bowl_width, handle_width) + 40
  image_height = bowl_height + handle_height + 60
  
  image = Image.new('RGB', (image_width, image_height), color='white')
  draw = ImageDraw.Draw(image)
  
  # Draw bowl
  bowl_x = (image_width - bowl_width) // 2
  bowl_y = 20
  create_bowl(draw, bowl_shape, bowl_x, bowl_y, bowl_width, bowl_height)
  
  # Draw handle
  handle_x = (image_width - handle_width) // 2
  handle_y = bowl_y + bowl_height
  create_handle(draw, handle_shape, handle_x, handle_y, handle_width, handle_height)
  
  return image

st.title("Spoon Designer")

# User inputs
bowl_shape = st.selectbox("Bowl Shape", ["Round", "Pointed", "Square"])
handle_shape = st.selectbox("Handle Shape", ["Straight", "Curved", "Tapered"])

bowl_width = st.slider("Bowl Width", 50, 200, 100)
bowl_height = st.slider("Bowl Height", 50, 200, 100)
handle_width = st.slider("Handle Width", 20, 100, 40)
handle_height = st.slider("Handle Height", 100, 300, 200)

# Generate and display image
if st.button("Generate Spoon Design"):
  spoon_image = create_spoon_image(bowl_shape, handle_shape, bowl_width, bowl_height, handle_width, handle_height)
  st.image(spoon_image, caption="Your Custom Spoon Design", use_column_width=True)
  
  # Option to download the image
  buf = io.BytesIO()
  spoon_image.save(buf, format="PNG")
  byte_im = buf.getvalue()
  st.download_button(
      label="Download Spoon Design",
      data=byte_im,
      file_name="custom_spoon_design.png",
      mime="image/png"
  )

# Created/Modified files during execution:
print("No files created. Image is generated in memory.")
