import re

infile = ".\\src\\chrome\\content\\mzts-settings.xul"

file = open(infile, "r")

fileText = file.read()

# print fileText

# ps = re.findall(r'<preference id="([\w\s.\-_=])"', fileText)
# ps = re.findall(r'<preference id="(.*)"', fileText)
# ps = re.findall(r'<preference id="(.*)"[\w\s]*name="(.*)"', fileText)
ps = re.findall(r'<preference[.="\-@\w\s]+/>', fileText)

print ps
for p in ps:

	p0 = re.sub(r'[\s]+', ' ', p)
	id = re.search(r'id[\s]*="([\w.\-_]*)"', p0).group(1)
	name = re.search(r'name[\s]*="([\w.\-_]*)"', p0).group(1)
	ptype = re.search(r'type[\s]*="([\w.\-_]*)"', p0).group(1)

	# print p0
	# print
	print "pref: ", id, " type: ", ptype
