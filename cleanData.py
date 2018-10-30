import csv

with open('EducationClean.csv', 'r') as csv_in, open('EducationFinal.csv', 'w') as csv_out:
    csv_reader = csv.reader(csv_in, delimiter=',')
    csv_writer = csv.writer(csv_out, delimiter=',')
    eduLevels = ['Less than high school', 'High school', 'Some college', 'College or more']
    for row in csv_reader:
        print (row)
        if row[1] == 'Area name':
            newRow = []
            newRow.append(row[0])
            newRow.append(row[1])
            newRow.append('Education level')
            for i in range(2,22,4):
                print(row[i][-5:])
                newRow.append(row[i][-4:])
            csv_writer.writerow(newRow)
        else:
            for i in range(2, 6):
                newRow = []
                newRow.append(row[0])
                newRow.append(row[1])
                newRow.append(eduLevels[i - 2])
                for j in range(0, 20, 4):
                    print(i + j)
                    newRow.append(row[i + j])
                    
                csv_writer.writerow(newRow)
            
                
    
