#!/usr/local/bin/perl

# Set server specific variables

  $path = "/www/htdocs/hankswarehouse";
  $image_list = "./image.list";
  
# print out the HTTP header

# The first thing to note about this script is that it is an 
# No-Parse-Header (NPH) script rather than a CGI script.  An NPH script 
# basically sends info directly to the browser without parsing the header 
# info in the script output.  We must bypass the server neding to read 
# through all of the documents first!  Okay, another thing we need to 
# assure is that I/O buffering doesn't screw the whole process up.  So we 
# need a forced flush ala flush.pl from the standard perl library.

    require "flush.pl";

# Okay, now since we axed the header above by making this an NPH-script, we 
# need to include the necessary info in our output.  Then we have to tell 
# the broswer that this is a server push script and the boundary separating 
# the (multipart/mixed) documents will by "ARandomString" and don't forget 
# the extra blank line!

    print "HTTP/1.0 200\n";
    print "Content-type: multipart/x-mixed-replace;boundary=ARandomString\n\n";

# Tell the browser that the first document is on the way.


# Okay, start sending the images!

# Open image.list and fill the images array with each item in the list

  open (IMAGELIST, "$image_list");
  while (<IMAGELIST>)
    {
    push(@images,$_);
    }
  close (IMAGELIST);

  foreach $image (@images)
    {
    print "--ARandomString\n";
    print "Content-type: image/gif\n\n";
    open (IMAGE, "<$path/$image");
    while (read(IMAGE, $buf, 1024))
      {
      print $buf;
      }
    close (IMAGE);
    sleep (3);
    print "\n--ARandomString\n";
    &flush(STDOUT);
    }


