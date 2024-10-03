import streamlit as st
import svgwrite
import math

def create_bowl_shape(dwg, shape, center_x, bowl_top, bowl_width, bowl_length):
  if shape == "Round":
      dwg.add(dwg.ellipse(center=(center_x, bowl_top), r=(bowl_width/2, bowl_length/2), 
                          fill='none', stroke=svgwrite.rgb(10, 10, 16, '%')))
  elif shape == "Pointed":
      points = [
          (center_x - bowl_width/2, bowl_top),
          (center_x, bowl_top - bowl_length),
          (center_x + bowl_width/2, bowl_top),
      ]
      dwg.add(dwg.polygon(points=points, fill='none', stroke=svgwrite.rgb(10, 10, 16, '%')))
  elif shape == "Square":
      dwg.add(dwg.rect(insert=(center_x - bowl_width/2, bowl_top - bowl_length), 
                       size=(bowl_width, bowl_length), 
                       fill='none', stroke=svgwrite.rgb(10, 10, 16, '%')))

def create_handle_shape(dwg, shape, center_x, handle_top, handle_bottom, handle_width):
  if shape == "Straight":
      dwg.add(dwg.line(start=(center_x - handle_width/2, handle_top), 
                       end=(center_x - handle_width/2, handle_bottom), 
                       stroke=svgwrite.rgb(10, 10, 16, '%')))
      dwg.add(dwg.line(start=(center_x + handle_width/2, handle_top), 
                       end=(center_x + handle_width/2, handle_bottom), 
                       stroke=svgwrite.rgb(10, 10, 16, '%')))
  elif shape == "Curved":
      curve_strength = 0.2
      control_point1 = (center_x - handle_width/2 - (handle_width * curve_strength), (handle_top + handle_bottom) / 2)
      control_point2 = (center_x + handle_width/2 + (handle_width * curve_strength), (handle_top + handle_bottom) / 2)
      
      path = dwg.path(d=f'M {center_x - handle_width/2},{handle_top} Q {control_point1[0]},{control_point1[1]} {center_x - handle_width/2},{handle_bottom}', 
                      fill='none', stroke=svgwrite.rgb(10, 10, 16, '%'))
      dwg.add(path)
      
      path = dwg.path(d=f'M {center_x + handle_width/2},{handle_top} Q {control_point2[0]},{control_point2[1]} {center_x + handle_width/2},{handle_bottom}', 
                      fill='none', stroke=svgwrite.rgb(10, 10, 16, '%'))
      dwg.add(path)
  elif shape == "Tapered":
      dwg.add(dwg.line(start=(center_x - handle_width/2, handle_top), 
                       end=(center_x - handle_width/4, handle_bottom), 
                       stroke=svgwrite.rgb(10, 10, 16, '%')))
      dwg.add(dwg.line(start=(center_x + handle_width/2, handle_top), 
                       end=(center_x + handle_width/4, handle_bottom), 
                       stroke=svgwrite.rgb(10, 10, 16, '%')))

def create_spoon_template(width, height, bowl_width, bowl_length, handle_width, handle_length, bowl_shape, handle_shape):
  dwg = svgwrite.Drawing('spoon_template.svg', profile='tiny', size=(f'{width}mm', f'{height}mm'))
  
  # Calculate dimensions
  total_length = bowl_length + handle_length
  start_y = (height - total_length) / 2
  center_x = width / 2
  
  # Draw bowl
  bowl_top = start_y + bowl_length
  create_bowl_shape(dwg, bowl_shape, center_x, bowl_top, bowl_width, bowl_length)
  
  # Draw handle
  handle_top = bowl_top
  handle_bottom = handle_top + handle_length
  create_handle_shape(dwg, handle_shape, center_x, handle_top, handle_bottom, handle_width)
  
  # Connect bowl to handle
  dwg.add(dwg.line(start=(center_x - handle_width/2, handle_top), end=(center_x - bowl_width/2, bowl_top), 
                   stroke=svgwrite.rgb(10, 10, 16, '%')))
  dwg.add(dwg.line(start=(center_x + handle_width/2, handle_top), end=(center_x + bowl_width/2, bowl_top), 
                   stroke=svgwrite.rgb(10, 10, 16, '%')))
  
  # Add centerline
  dwg.add(dwg.line(start=(center_x, start_y), end=(center_x, handle_bottom), 
                   stroke=svgwrite.rgb(10, 10, 16, '%'), stroke_dasharray='5,5'))
  
  # Add dimensions
  font_size = 8
  dwg.add(dwg.text(f'{total_length}mm', insert=(width - 40, height - 10), font_size=font_size))
  dwg.add(dwg.text(f'{bowl_width}mm', insert=(10, bowl_top), font_size=font_size))
  dwg.add(dwg.text(f'{handle_width}mm', insert=(10, handle_bottom - 20), font_size=font_size))
  
  dwg.save()
  return 'spoon_template.svg'

# Streamlit UI
st.title("Spoon Template Designer")
st.write("Design your custom spoon template by adjusting the parameters below:")

# User input for spoon dimensions and design
spoon_width = st.slider("Template Width (mm)", min_value=100, max_value=300, value=200)
spoon_height = st.slider("Template Height (mm)", min_value=200, max_value=400, value=300)
bowl_width = st.slider("Bowl Width (mm)", min_value=30, max_value=100, value=60)
bowl_length = st.slider("Bowl Length (mm)", min_value=50, max_value=150, value=80)
handle_width = st.slider("Handle Width (mm)", min_value=10, max_value=50, value=20)
handle_length = st.slider("Handle Length (mm)", min_value=100, max_value=250, value=180)

# Bowl and handle shape selection
bowl_shape = st.selectbox("Bowl Shape", ["Round", "Pointed", "Square"])
handle_shape = st.selectbox("Handle Shape", ["Straight", "Curved", "Tapered"])

# Generate and display the SVG
if st.button("Generate Spoon Template"):
  svg_file = create_spoon_template(spoon_width, spoon_height, bowl_width, bowl_length, handle_width, handle_length, bowl_shape, handle_shape)
  st.success(f"Spoon template generated: {svg_file}")
  
  # Display the SVG file
  st.image(svg_file)
  
  # Option to download the SVG
  with open(svg_file, 'rb') as f:
      st.download_button(label="Download Spoon Template", data=f, file_name=svg_file, mime='image/svg+xml')

# Created/Modified files during execution:
print("spoon_template.svg")
