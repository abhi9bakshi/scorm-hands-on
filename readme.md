#SCORM (Sharable Content Object Reference Model)

SCORM is a standard for creating E-learning software products. You can find details about it's history and purpose scattered all over the [internet](https://www.google.com/search?q=scorm) so I won't bore you with that. If you have arrived here, I assume that you have already read a lot and now you want to implement. If you haven't done that yet, [this](http://scorm.com/scorm-explained/technical-scorm/) is a must read before you proceed further. So, without further ado, let's get started.


##Chapter 1: Let's play Golf

This chapter focuses on getting a solid understanding of the structure of a SCORM course. If you are already familiar with the structure, or you want to directly learn how a SCORM course communicates with LMS, you can jump to Chapter 2. I will recommend sticking through this chapter if you are new to SCORM.

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
| ├─launchpage.html
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
  
If you refer to [SCORM user guide for programmers](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/resources/books/SCORM_Users_Guide_for_Programmers.pdf), Page 10 - Page 16, you can see that this structure relates to SCORM components as follows:
 
  ![Components of SCORM content](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/Components%20of%20SCORM%20content.png
)


The 4 .xsd files in the root directory are XML schema definition files that define the format of the SCORM manifest file and must be included in every SCORM package. 


Now, if you check **line 34** of _imsmanifest.xml_ file, you will see it has an _href_ attribute which points to _shared/launchpage.html_. This is the page which shows up when you launch this course in moodle. So, let's jump right into that page.

#####launchpage.html

Once you open **launchpage.html**, you will see a lot of javascript code. Skipping all the initialization, jump directly to body section (line 318). If you look at it's structure, you will realize it's very simple with only a frame and a navigation div.

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

Lines 5-7 import the stylesheet. The javascript sourced by line 9(_contentfunctions.js_) contains HTML which is injected using line 21 & 22 on the page. 

From what I can see, I find line 8(_scormfunctions.js_) to be redundant, since it was already loaded in _launchpage.html_ and no scorm calls have been done from this page, but, I may be wrong.

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

Upon opening the page, you see many lines of javascript. Skipping all that, jump directly to body section(line 193). There you can see two functions, **RenderTest** and **AddTagLine**. The function **AddTagLine** simply injects a line from _contentfunctions.js_. Let's seehow **RenderTest** function works. 


If you have dealt with _Spaghetti Code_ earlier, you will feel right at home here. But trust me, we can get through it if we take it in one piece at a time. In order to understand **RenderTest** function, you must know first what happens during the initialization. So, let's get started:


**Line 35 - Line 39**

This code is executed as soon as the page loads. What it does is takes in the arguements passed in Line 63 of _launchpage.html_ and breaks it down into an array of string. So the result is as follows:

Input:
```
shared/assessmenttemplate.html?questions=Playing&questions=Etiquette&questions=Handicapping&questions=HavingFun
```

Output:
```
includeFiles[0] = "Playing"
includeFiles[1] = "Etiquette"
includeFiles[2] = "Handicapping"
includeFIles[3] = "HavingFun"
```


**Line 40**

If you check your directory structure, you can see that each of the 4 directories, viz.

* Playing
* Etiquette
* Handicapping
* HavingFun

have a file called _questions.js_.

So, what this line does is that it takes names of these directories from the includeFiles array and appends them as a script to original document.

Input
```
includeFiles[0] = "Playing"
includeFiles[1] = "Etiquette"
includeFiles[2] = "Handicapping"
includeFIles[3] = "HavingFun"
```

Output
```
<script src="../Playing/questions.js" type="text/JavaScript"></script>
<script src="../Etiquette/questions.js" type="text/JavaScript"></script>
<script src="../Handicapping/questions.js" type="text/JavaScript"></script>
<script src="../HavingFun/questions.js" type="text/JavaScript"></script>
```


Now, if you check any of the _questions.js_ files, it's structure is 

```javascript
test.AddQuestion( new Question ("com.scorm.golfsamples.interactions.etiquette_1",
                                "When another player is attempting a shot, it is best to stand:", 
                                QUESTION_TYPE_CHOICE,
                                new Array("On top of his ball", "Directly in his line of fire", "Out of the player's line of sight"),
                                "Out of the player's line of sight",
                                "obj_etiquette")
                );
```

So, when the questions.js files are added below line 40, they are immediately executed, which calls the function **AddQuestion** at line 26 in _assessmenttemplate.html_.


**Line 26 - Line 29**

This code creates a new _Questions_ object for each question in _questions.js_. 

Input
```javascript
test.AddQuestion( new Question ("com.scorm.golfsamples.interactions.etiquette_1",
                                "When another player is attempting a shot, it is best to stand:", 
                                QUESTION_TYPE_CHOICE,
                                new Array("On top of his ball", "Directly in his line of fire", "Out of the player's line of sight"),
                                "Out of the player's line of sight",
                                "obj_etiquette")
                );
```

Output
```
Questions[0] = new Question ("com.scorm.golfsamples.interactions.etiquette_1",
                                "When another player is attempting a shot, it is best to stand:", 
                                QUESTION_TYPE_CHOICE,
                                new Array("On top of his ball", "Directly in his line of fire", "Out of the player's line of sight"),
                                "Out of the player's line of sight",
                                "obj_etiquette")
```


**Line 14 - Line 21**

For each question, the function **Question** is invoked, which creates new Question objects. So, when all _questions.js_ files are done processing, you get an array of questions whose each index is accessible by **Questions** array.



_Now that the initialization is done, we can proceed to the **RenderTest** function._


**Line 142 - Line 188**

This code is pretty much self explanatory. The execution logic is as follows:

```
Loop through the array of Questions
| └─Print the question
├─ Check if question is CHOICE type
|  └─ Loop through the array of answers
|    └─ Print all answers
├─ Check if questionn is TRUE-FALSE type
|  └─ Print TRUE and FALSE
└─ Check if question is NUMERIC type
   └─ Print an input box for getting answer
```

At the end, it adds a **SubmitAnswers** function on line 186, which when clicked, evaluates the answers. So now that we are done printing all questions, let's jump to **SubmitAnswers** function to see how answers are evaluated.


**Line 59 - Line 106**

This code basically stores two variables for each question, viz.

* correctAnswer
* learnerResponse


**Line 108 - Line 109**

This code checkes if the **learnerResponse** is same as the **correctAnswer**, if yes, increments the **correctCount**.


**Line 121 - Line 134**

This code generates a **resultSummary**, which is then displayed to the user once he/she submits the test.


**Line 111 - Line 119 and Line 136 - Line 138**

This code is meant to send tracking information to the LMS about **Questions** and **Test** in overall. Here, you can see, two functions are called, viz. 

* RecordQuestion
* RecordTest

Now, if you jump back to _launchpage.html_, at **Line 206**, you can see function **RecordTest** which makes 4 SCORM calls, viz.

1. cmi.core.score.raw
2. cmi.core.score.min
3. cmi.core.score.max
4. cmi.core.lesson_status

where first 3 define the max, min and obtained score, while last one is boolean variable which is set true or false based on the passing criteria. You can read more about them at [SCORM 1.2 Run Time Environment Book](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/resources/books/SCORM_1.2_RunTimeEnv.pdf) **Page 35 - Page 38**

In this example, however, developers have not implemented the **RecordQuestions** function. So, we are not tracking the results on a per-question granularity.


###Summing Up

In this chapter, we gained a solid understanding of the structure defined by SCORM for creating SCORM content. We saw 6 scorm calls 

1. cmi.core.lesson_location
2. cmi.core.lesson_status
3. cmi.core.score.raw
4. cmi.core.score.min
5. cmi.core.score.max
6. cmi.core.lesson_status

for tracking course position and score.

In the next chapter, we will study how we can use SCORM 1.2 for communicating with any LMS.



##Chapter 2: Hello LMS

In the previous chapter, we saw 6 SCORM calls. But, did you realize we never tried to trace these calls. In fact, we skipped the initialization part at the beginning of first chapter. Well, that was intentional to avoid confusion. The purpose of Chapter 1 was to understand the structure of a SCORM course and not how it communicates with LMS. But now that we have a solid understanding of the structure, we are ready to dig into the nitty gritty details of working with SCORM. So, let's get started.


#####launchpage.html

Open the _launchpage.html_ file in golf course. If you look at the flow of execution, it proceeds as follows:

**body onload**(line 318) --> **doStart**(line 74) --> **ScormProcessInitialize**(line 83)

Now, **ScormProcessInitialize** function is defined in _scormfunctions.js_. But, before we jump to _scormfunctions.js_, let's take a look at [SCORM Run Time Environment](http://scorm.com/scorm-explained/technical-scorm/run-time/). If you check that article, you will find that SCORM 1.1/1.2 has 8 API calls, viz.

```
LMSInitialize( “” ) : bool
LMSFinish( “” ) : bool
LMSGetValue( element : CMIElement ) : string
LMSSetValue( element : CMIElement, value : string) : string
LMSCommit( “” ) : bool
LMSGetLastError() : CMIErrorCode
LMSGetErrorString( errorCode : CMIErrorCode ) : string
LMSGetDiagnostic( errocCode : CMIErrorCode ) : string
```

These API calls are used by the SCORM course to communicate with the LMS. We assume that you have already read articles on Content Packaging, Run-Time, and Sequencing at [SCORM](http://scorm.com/scorm-explained/technical-scorm/) website so we won't go into the details for that. So, taking these 8 API calls into consideration, let's jump to **ScormProcessInitialize** function in _scormfunctions.js_.


#####scormfunctions.js

**Line 98 -  Line 101**

The first thing done during initialization is finding the LMS API for initiating a session. [SCORM RTE](http://scorm.com/scorm-explained/technical-scorm/run-time/) documentation provides a very good overview of that process. 


**Line 108**

This is where we try to initiate a connection with the LMS using the SCORM API call `LMSInitialize( "" ) : bool` once the API is found. 


**Line 111 - Line 113**

In these lines we use 3 SCORM API calls
```
LMSGetLastError() : CMIErrorCode
LMSGetErrorString( errorCode : CMIErrorCode ) : string
LMSGetDiagnostic( errocCode : CMIErrorCode ) : string
```
to get error information in case of an error in initialization.


**Line 121**

Once everything is successfully executed in **ScormProcessInitialize** function, we set the variable **initialized** to _true_.
