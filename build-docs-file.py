import os
import re

def save_flattened_mdx_contents(directory, output_file='flattened_mdx.txt'):
    """
    Recursively find all .mdx files, flatten their contents to a single line,
    and save to an output file.
    
    Args:
        directory (str): The root directory to start searching from
        output_file (str, optional): Path to the output file. Defaults to 'flattened_mdx.txt'
    """
    # Track the number of MDX files processed
    mdx_file_count = 0
    
    # Open the output file in write mode
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Walk through the directory tree
        for root, dirs, files in os.walk(directory):
            # Find all .mdx files in the current directory
            mdx_files = [
                file for file in files 
                if file.lower().endswith('.mdx')
            ]
            
            # Process each MDX file
            for mdx_filename in mdx_files:
                # Construct full file path
                full_path = os.path.join(root, mdx_filename)
                
                try:
                    # Read the contents of the MDX file
                    with open(full_path, 'r', encoding='utf-8') as mdx_file:
                        # Read the entire file
                        content = mdx_file.read()
                        
                        # Remove multiple whitespaces and replace newlines with a single space
                        flattened_content = re.sub(r'\s+', ' ', content).strip()
                        
                        # Write the flattened content with a file path header
                        outfile.write(f"{full_path}:::{flattened_content}\n")
                        
                        # Increment the file count
                        mdx_file_count += 1
                
                except Exception as e:
                    print(f"Error reading file {full_path}: {e}")
    
    print(f"Found and flattened contents of {mdx_file_count} .mdx files to {output_file}")

# Example usage
if __name__ == "__main__":
    # Replace with the directory you want to search
    search_directory = "."  # Current directory by default
    
    save_flattened_mdx_contents(search_directory)