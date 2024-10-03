import streamlit as st
import svgwrite

# Function to create a basic SVG template
def create_spoon_template(width, height, curve_depth):
    # Create an SVG drawing
    dwg = svgwrite.Drawing('spoon_template.svg', profile='tiny', size=(f'{width}mm', f'{height}mm'))
    
    # Draw the outline of the spoon (example: a symmetrical spoon)
    # We will create a simple curve for the spoon bowl and handle
    start_point = (width / 2, height * 0.2)
    bowl_top = (width * 0.1, height * 0.5)
    bowl_bottom = (width * 0.9, height * 0.5)
    
    # Draw the spoon bowl curve
    dwg.add(dwg.line(start=start_point, end=bowl_top, stroke=svgwrite.rgb(10, 10, 16, '%')))
    dwg.add(dwg.line(start=start_point, end=bowl_bottom, stroke=svgwrite.rgb(10, 10, 16, '%')))
    
    # Optional: Add more curves/lines for details like spoon depth, etc.
    
    # Save the drawing
    dwg.save()
    return 'spoon_template.svg'

# Streamlit UI
st.title("Spoon Template Designer")
st.write("Design your custom spoon template by adjusting the parameters below:")

# User input for spoon dimensions and design
spoon_width = st.slider("Spoon Width (mm)", min_value=50, max_value=200, value=100)
spoon_height = st.slider("Spoon Height (mm)", min_value=100, max_value=300, value=150)
curve_depth = st.slider("Curve Depth (mm)", min_value=10, max_value=50, value=20)

# Generate and display the SVG
if st.button("Generate Spoon Template"):
    svg_file = create_spoon_template(spoon_width, spoon_height, curve_depth)
    st.success(f"Spoon template generated: {svg_file}")
    
    # Display the SVG file
    st.image(svg_file)
    
    # Option to download the SVG
    with open(svg_file, 'rb') as f:
        st.download_button(label="Download Spoon Template", data=f, file_name=svg_file, mime='image/svg+xml')
