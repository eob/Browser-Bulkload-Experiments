import sqlite3
import random

alphabet = 'abcdefghijklmnopqrstuvwxyz'
schema = ('var1', 'var2', 'var3', 'var4', 'var5')
rowcounts = (500,1000,5000,10000,50000,100000,200000)

def randstring(length):
    string = ''
    for x in range(0,length):
        string += random.choice(alphabet)
    return string

def build_sqlite_dataset(schema, numrows):
    print "Creating DB with %i rows" % numrows
    db = sqlite3.connect("bulkload_%i.sqlite" % numrows)
    fields = ["%s varchar(255)"%field for field in schema]
    create_sql = "CREATE TABLE noise(%s);" % ','.join(fields)
    insert_sql = "INSERT INTO noise(%s) VALUES (?, ?, ?, ?, ?)" % ','.join(schema)
    db.execute(create_sql)
    for i in range(0,numrows):
        db.execute(insert_sql, [randstring(255), randstring(255), randstring(255), randstring(255), randstring(255)])
    db.commit()
    db.close()
    print "Created DB with %i rows" % numrows

for rowcount in rowcounts:
    # Generate a data set
    build_sqlite_dataset(schema, rowcount)
    # Todo: put JSON dataset build call here
    # Note: the JSON files will have different strings, but they are fixed
    # length random strings so this shouldn't affect compression, etc.