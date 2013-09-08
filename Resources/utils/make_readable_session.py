input_file = open("../data/session.json", 'r' )
out = open("../data/readable_session.txt", 'w')

depth = 0;
print_line = ''

def tabs(depth):
    tab_string = ''
    for x in range(0, depth):
        tab_string = tab_string + "\t"

    return tab_string

in_string = False
for line in input_file:
    for char in line:
        if char == "{":
            print_line = print_line + '\n' + tabs(depth) + '{\n' 
            depth = depth + 1
            print_line = print_line + tabs(depth)
        elif char == "}":
            depth = depth - 1
            print_line = print_line + '\n' + tabs(depth) + '}'
        elif char == ',' and not in_string:
            print_line = print_line + ',\n' + tabs(depth)
        elif char == '"':
            in_string = not in_string
            print_line = print_line + '"'
        else:
            print_line = print_line + char

out.write(print_line)
print "All done!"
            
