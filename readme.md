#SCORM (Sharable Content Object Reference Model)

SCORM is a standard for creating E-learning software products. You can find details about it's history and purpose scattered all over the [internet](https://www.google.com/search?q=scorm) so I won't bore you with that. If you have arrived here, I assume that you have already read a lot and now you want to implement. So, without further ado, let's get started.


##Things you will need

Since I am using windows right now, I will write this tutorial for windows OS, but, with just a little bit of google search, you can implement the same in Linux.

1. [XAMPP](https://www.apachefriends.org/download.html)
2. [Moodle Bitnami module for XAMPP](https://bitnami.com/stack/xampp)
3. [SCORM golf example package](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/scorm_golf/golf.zip)


##Getting Started

Download and install xampp ([?](http://www.wikihow.com/Install-XAMPP-for-Windows)) first followed by moodle bitnami package. Once you are done with that, upload golf course to moodle ([?](http://www.ispringsolutions.com/articles/add-scorm-course-into-moodle.html)). Remember to set the course to open in a new window ( _Adding a new SCORM package -> Appearance -> Display package -> New Window_ )

Now launch the course to check if it's working properly. If not, google around to check what you have missed.



##Understandng the Structure

Now that you got a working course, it's time to get a deeper understanding of it's structure. If you unzip the **golf.zip** file you downloaded earlier, you will get a structure somewhat like this

```
Golf
	-Module(s)
		-module.html
		-questions.js
    -image.jpg
	-Shared
		-assessmenttemplate.html
    -launchpage.html
		-contentfunctions.js
    -scormfunctions.js
    -style.css
    -image.jpg
	adlcp_rootv1p2.xsd
	ims_xml.xsd
	imscp_rootv1p1p2.xsd
	imsmanifest.xml
	imsmd_rootv1p2p1.xsd
  ```
  
  
  So, the first question which comes to your mind is, **What are these files**.
