#SCORM (Sharable Content Object Reference Model)

SCORM is a standard for creating E-learning software products. You can find details about it's history and purpose scattered all over the [internet](https://www.google.com/search?q=scorm) so I won't bore you with that. If you have arrived here, I assume that you have already read a lot and now you want to implement. If you haven't done that yet, [this](http://scorm.com/scorm-explained/technical-scorm/) is a must read before you proceed further. So, without further ado, let's get started.


##Chapter 1: Meet SCORM

###Things you will need

Since I am using windows right now, I will write this tutorial for windows OS using SCORM v1.2, but, with just a little bit of google search, you can implement the same in Linux.

1. [XAMPP](https://www.apachefriends.org/download.html)
2. [Moodle Bitnami module for XAMPP](https://bitnami.com/stack/xampp)
3. [SCORM golf example package](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/scorm_golf/golf.zip)


###Setting Up

Download and install xampp ([?](http://www.wikihow.com/Install-XAMPP-for-Windows)) first followed by moodle bitnami package. Once you are done with that, upload golf course to moodle ([?](http://www.ispringsolutions.com/articles/add-scorm-course-into-moodle.html)). Remember to set the course to open in a new window ( _Adding a new SCORM package -> Appearance -> Display package -> New Window_ )

Now launch the course to check if it's working properly. If not, google around to check what you have missed.



###Understandng the Structure

Now that you got a working course, it's time to get a deeper understanding of it's structure. If you unzip the **golf.zip** file you downloaded earlier, you will get a structure somewhat like this

```
Golf
├─Module(s)
| ├─module.html
| ├─questions.js
| └─image.jpg
├─Shared
| ├─page.html
| ├─contentfunctions.js
| ├─scormfunctions.js
| ├─style.css
| └─image.jpg
├─adlcp_rootv1p2.xsd
├─ims_xml.xsd
├─imscp_rootv1p1p2.xsd
├─imsmanifest.xml
└─imsmd_rootv1p2p1.xsd
  ```
  
  
  So, the first question which comes to your mind is, **What are these files**.

#####imsmanifest.xml
  The first and most important file among these is the _**imsmanifest.xml**_. If you open that file, you can see it's structure is similar to image shown below. 
![imsmanifest.xml structure](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/imsmanifest%20structure.png
)
  
If you refer to [SCORM user guide for programmers](https://adlnet.gov/wp-content/uploads/2011/12/SCORM_Users_Guide_for_Programmers.pdf), Page 10 - Page 16, you can see that this structure relates to SCORM components as follows:
 
  ![Components of SCORM content](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/Components%20of%20SCORM%20content.png
)


The 4 .xsd files in the root directory are XML schema definition files that define the format of the SCORM manifest file and must be included in every SCORM package. 


Now, if you check **line 34** of _imsmanifest.xml_ file, you will see it has an _href_ attribute which points to _shared/launchpage.html_. This is the page which shows up when you launch this course in moodle. So, let's jump right into that page.

#####launchpage.html

Once you open **launchpage.html**, you will see a lot of javascript code. Skipping all that, jump directly to body section (line 318). If you look at it's structure, you will realize it's very simple with only a frame and a navigation div.

1. Content Frame
2. Nav Div
  * Previous
  * Next
  * Exit


At line 318, you can see, when this page loads, it calls the **doStart** function, located at line 74, which does the necessary initialization. Once the initialization is done, you navigate through the course by pressing the next and previous buttons which in turn calls **next**(line 177) and **previous**(line 170) functions. Both of these functions call function **goToPage**(line 113). If you skip the code for disabling buttons, you can see that your progress is being tracked even when you are navigating through the course using the following code:

```javascript
 //save the current location as the bookmark
ScormProcessSetValue("cmi.core.lesson_location", currentPage);

//in this sample course, the course is considered complete when the last page is reached
if (currentPage == (pageArray.length - 1)){
    reachedEnd = true;
    ScormProcessSetValue("cmi.core.lesson_status", "completed");
```

You can refer [SCORM 1.2 Run Time Environment manual](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/resources/books/SCORM_1.2_RunTimeEnv.pdf) to know more about **cmi.core.lesson_location**(page 30) and **cmi.core.lesson_status**(page 32).


So, now you know, at least on a basic level, how the tracking is done. But, how are the pages loaded dynamically? Well, in this case, if you refer to launchpage.html line 47, you will see a **pageArray** with 15 elements, each being a relative URL to a page. If you jump to line 120, you can see this same array is used to source content to content frame.

```javascript
//navigate the iFrame to the content
theIframe.src = "../" + pageArray[currentPage];
```


Let's take a look at one of these pages to see what goes in there. Jump to _Playing/Playing.html_ page.

#####playing.html

As is evident, this page comprises of mostly plain HTML. Since that is rendered as-is by the browser, let's take a look at the non-html content. 

Lines 5-7 import the stylesheet. The javascript sourced by line 9_(contentfunctions.js)_ contains HTML which is injected using line 21 & 22 on the page. 

From what I can see, I find line 8_(scormfunctions.js)_ to be redundant, since it was already loaded in _launchpage.html_ and no scorm calls have been done from this page, but, I may be wrong.

So, basically all this page is, is plain HTML. All SCORM calls is still being made by _launchpage.html_.

But, there's one page, where things get different. If you go back to _launchpage.html_ and check line 63, you can see the URL is for _assessmenttemplate.html_, which, in the Golf example, is the Quiz. 
```javascript
pageArray[14] = "shared/assessmenttemplate.html?questions=Playing&questions=Etiquette&questions=Handicapping&questions=HavingFun";
```

Also, you can see 4 arguements passed as string in the same GET request:

1. questions=Playing
2. questions=Etiquette
3. questions=Handicapping
4. questions=HavingFun

Now, let's jump to _assessmenttemplate.html_ to see how the quiz is handled.

#####assessmenttemplate.html
