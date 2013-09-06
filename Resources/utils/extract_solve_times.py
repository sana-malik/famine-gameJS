input_file = open("../data/session.txt", 'r' )
out = open("../data/solve_times.txt", 'w')

def tabs(depth):
    tab_string = ''
    for x in range(0, depth):
        tab_string = tab_string + "\t"

    return tab_string

def getTime(line):
    in_string = False
    this_line = ''
    time = ''
    
    for char in line:
        if char == ">":
            in_string = True
        elif char == "<":
            in_string = False
        elif in_string:
            this_line = this_line + char
        
        if in_string == False and len(this_line) > 0:
            if '/' in this_line:
                time = this_line
                
            this_line = ''

    return time.strip()[10:-1]

start_time = ''
solve_time = ''
name = ''

second_last_line = ''
last_line = ''

for line in input_file:
    if "current_worth" in line:
        name = second_last_line.replace('"', '').strip()[:-1]
        start_time = ''
        solve_time = ''
        
    if "Puzzle Started" in line:
        start_time = getTime(line)
    
    if "sec_elapsed" in line:
        solve_time = getTime(last_line)

    if len(name)>0 and len(start_time)>0 and len(solve_time)>0:
        out.write(name + ":\n\tStart Time: "+start_time+"\n\tSolve Time: " + solve_time + "\n\n")
        name = ''
        start_time = ''
        solve_time = ''

    second_last_line = last_line
    last_line = line
        
out.close()
print "All done!"
            
