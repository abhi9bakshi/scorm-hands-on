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

####imsmanifest.xml
  The first and most important file among these is the _**imsmanifest.xml**_. If you open that file, you can see it's structure is similar to image shown below. 
![imsmanifest.xml structure](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/imsmanifest%20structure.png
)
  
If you refer to [SCORM user guide for programmers](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/resources/books/SCORM_Users_Guide_for_Programmers.pdf), Page 10 - Page 16, you can see that this structure relates to SCORM components as follows:
 
  ![Components of SCORM content](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/Components%20of%20SCORM%20content.png)


The 4 .xsd files in the root directory are XML schema definition files that define the format of the SCORM manifest file and must be included in every SCORM package. 


Now, if you check **line 34** of _imsmanifest.xml_ file, you will see it has an _href_ attribute which points to _shared/launchpage.html_. This is the page which shows up when you launch this course in moodle. So, let's jump right into that page.

####launchpage.html

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

####playing.html

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

####assessmenttemplate.html

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

In this chapter, we will go through the entire code of [SCORM Golf example]([SCORM golf example package](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/scorm_golf/golf.zip) and understand how a SCORM course communicates with the LMS.

In the previous chapter, we saw 6 SCORM calls. But, did you realize we never tried to trace these calls. In fact, we skipped the initialization part at the beginning of first chapter. Well, that was intentional to avoid confusion. The purpose of Chapter 1 was to understand the structure of a SCORM course and not how it communicates with LMS. But now that we have a solid understanding of the structure, we are ready to dig into the nitty gritty details of working with SCORM. So, let's get started.


####launchpage.html

Open the _launchpage.html_ file in golf course. If you look at the flow of execution, it proceeds as follows:

**body onload**(line 318) --> **doStart**(line 74) --> **ScormProcessInitialize**(line 83)

Now, **ScormProcessInitialize** function is defined in _scormfunctions.js_. But, before we jump to _scormfunctions.js_, let's take a look at [SCORM Run Time Environment manual](http://scorm.com/scorm-explained/technical-scorm/run-time/). If you check that article, you will find that SCORM 1.1/1.2 has 8 API calls, viz.

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


####scormfunctions.js

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


####launchpage.html

Upon successful initialization, we proceed to 

**Line 87**

where we try to fetch lesson status by calling function **ScormProcessGetValue**.


####scormfunctions.js

The code execution flow proceeds to 

**Line 157**

where, upon successful check for LMS connection, we use SCORM API call

```
LMSGetValue( element : CMIElement ) : string
```
to fetch lesson status.


####launchpage.html

Upon successfully fetching lesson status, the control returns to _launchpage.html_ 

**Line 88**

where, it checks if the lesson status is `"not attempted"`. Now, if you refer to [SCORM Run Time Environment manual](http://scorm.com/scorm-explained/technical-scorm/run-time/) page 67, you will get a list of data model elements and their possible values. The values possible for `cmi.core.lesson_status` are

* passed
* completed
* failed
* incomplete
* browsed
* not attempted

Initially when you launch a course, `lesson_status` for each module is set to `not attempted` by the LMS. It is the responsibility of the developer to set it to one of the 5 remaining statuses as per the course requirement. In this case, we set it to `incomplete` using the function **ScormProcessSetValue**.

####scormfunctions.js

The code execution flow proceeds to

**Line 183**

where, the function **ScormProcessSetValue** accepts two arguements

* element
* value

and uses the SCORM API call

```
LMSSetValue( element : CMIElement, value : string) : string
```

to set the value of `lesson_status` to `incomplete`.


**Note:** If you check the list of API calls, you can see that we have already covered 6 of them. viz. 

```
LMSInitialize( “” ) : bool
LMSGetValue( element : CMIElement ) : string
LMSSetValue( element : CMIElement, value : string) : string
LMSGetLastError() : CMIErrorCode
LMSGetErrorString( errorCode : CMIErrorCode ) : string
LMSGetDiagnostic( errocCode : CMIErrorCode ) : string
```

the flow of code now proceeds to 

####launchpage.html

**line 94** where we obtain `lesson_location` from previous session to resume the lesson where the user left it earlier. Now that this process is complete, the user is able to see the entire course and navigate through it. Once the user is done with the course and he/she exits, which calls the function **doUnload** at line 146. 

This function records the time the student spent on the session, and then calls the function **ScormProcessFinish**.

####scormfunctions.js

which gets executed in

**Line 124**

here, we make our 7th SCORM API call, viz.

```
LMSFinish( “” ) : bool
```

which tells the LMS that the SCO is done communicating with it. Thus the session terminates and the LMS displays the results supplied by the SCO to the user.


Here, we have completed tracing how the Golf SCORM course communicates with the LMS. However, you might have noticed we haven't used the API call `LMSCommit( “” ) : bool` at all. If you take a look at the [SCORM 1.2 Run Time Environment manual](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/resources/books/SCORM_1.2_RunTimeEnv.pdf) page 19, you can see that the sole purpose of `LMSCommit()` API call is to push the data stored at the client upon calling `LMSSetValue()` to the server, which in this case, is the LMS. 

You can summarize the entire flow by this diagram:

![Run Time Environment Behaviour](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/resources/images/runtime%20environment%20behaviour.png)

In the next chapter, we will take a look at developing our first SCORM from (almost) scratch.



##Chapter 3: Your first scorm course

Up till now, we have been working on someone else's code, trying to get an understanding of how things work in SCORM. But now, things get real. You have to make a SCORM course and you are going to do that all by yourself. But, if you're going to do it, you better do it right, right? The good news is that it's not that difficult to make one given the amount of quality resources available on the internet. So, without further ado, let's get started.

###Things you will need:

1. [SCORM 1.2 XML schema definition files](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/chapters/Chapter%203/Lesson%201/scorm_xml_schema_definition.zip) also available at [SCORM website](http://scorm.com/scorm-explained/technical-scorm/content-packaging/xml-schema-definition-files/)
2. [SCORM 1.2 API Wrapper](https://raw.githubusercontent.com/abhi9bakshi/scorm-hands-on/master/chapters/Chapter%203/Lesson%201/SCORM_12_APIWrapper.js)
3. [The evolution of Pikachu demo course](https://github.com/abhi9bakshi/scorm-hands-on/raw/master/chapters/Chapter%203/Lesson%201/the_evolution_of_pikachu.zip)


###Lesson 1: Laying the foundation

Download and extract these files in a folder. I assume that your folder structure is as follows:
```
scorm_project
├─ scorm_xml_schema_definition
├─ the_evolution_of_pikachu
└─ SCORM_12_APIWrapper.js
```

Now, if you open `the_evolution_of_pikachu`, you will see that all that file contains is pure HTML, CSS and Javascript for styling and behaviour. You can see a working Run-time environment by opening `the_evolution_of_pikachu/scorm_rte/index.html` file. It's very basic but it does the job for this tutorial. You can also see that we haven't used any SCORM calls here yet. So, this course can function standalone but it won't work in an LMS.

The point of setting this structure is to emphasize that a SCORM course is not tightly coupled, it consists of three loosely coupled components, viz.

1. The Module
2. The Run-Time Environment
3. The SCORM wrapper

So, let's integrate these components to set up a SCORM compliant course.


###Lesson 2: Setting things up

Open your `scorm_project` directory. Go to `scorm_xml_schema_definition` folder and move all it's contents inside `the_evolution_of_pikachu` folder. Now, move `SCORM_12_APIWrapper.js` inside `the_evolution_of_pikachu/scorm_rte/scripts` folder. Inside the same folder, i.e. `the_evolution_of_pikachu/scorm_rte/scripts`, create an empty file called `scorm.js`.

So now, your folder structure should look like this:
```
scorm_project
└─ the_evolution_of_pikachu
    ├─ modules
    ├─ scorm_rte
    |    ├─ assets
    |    ├─ scripts
    |    |    ├─ common.js
    |    |    ├─ loadModule.js
    |    |    ├─ scorm.js
    |    |    └─ SCORM_12_APIWrapper.js
    |    ├─ styles
    |    ├─ index.html
    |    └─ modules.xml
    ├─ adlcp_rootv1p2.xsd
    ├─ ims_xml.xsd
    ├─ imscp_rootv1p1p2.xsd
    ├─ imsmanifest.xml
    └─ imsmd_rootv1p2p1.xsd
```

If you look at the `SCORM_12_APIWrapper.js` file, you can see that it contains well structured code for 

* Initialize
* Finish
* GetValue
* SetValue
* Commit
* GetLastError
* GetErrorString
* GetDiagnostic

API calls and also functions to find LMS API. Makes our life easier. 


###Lesson 3: The imsmanifest file

This file describes the content package and is a must for every SCORM package. It's structure is described at [SCORM website](http://scorm.com/scorm-explained/technical-scorm/content-packaging/manifest-structure/). Open `imsmanifest.xml` file and edit lines **21, 23, 28 and 29** to this

```
<?xml version="1.0" ?>
<!-- 
Manifest template to demonstrate the proper XML namespace declarations for
SCORM 1.2 manifests. 

Provided by Rustici Software - www.scorm.com.
-->
<manifest identifier="com.scorm.manifesttemplates.scorm12" version="1"
       xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
       xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                           http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                           http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
	<metadata>
		<schema>ADL SCORM</schema>
		<schemaversion>1.2</schemaversion>
	</metadata>
	<organizations default="B0">
		<organization identifier="B0">
			<title>The Evolution of Pikachu</title> 
			<item identifier="i1" identifierref="r1" isvisible="true">
				<title>The Evolution of Pikachu</title> 
			</item>
		</organization>
	</organizations>
	<resources>
		<resource identifier="r1" type="webcontent" adlcp:scormtype="sco" href="scorm_rte/index.html">
			<file href="scorm_rte/index.html" />
		</resource>
	</resources>
</manifest>
```


###Lesson 4: Initialize and Finish a Session

Before we add any code to comunicate with the LMS, let's source the `scorm.js` file in `index.html`. To do that, open `scorm_rte/index.html` in a text editor, and add 
```html
<script src="scripts/SCORM_12_APIWrapper.js"></script>
<script src="scripts/scorm.js"></script>
```
below above line 7.


Now, let's open `scorm.js` file located at `scorm_rte/scripts/`. Inside that file, paste the following code:

```javascript
function initializeLMS(){
	var initSuccess = doLMSInitialize();
	console.log(initSuccess);
}

function finishLMS(){
	var finSuccess = doLMSFinish();
	console.log(finSuccess);
}
```

Now, you need to call these functions as needed. Open `common.js` file located at `scorm_rte/scripts`. Inside that file, add the following line
```javascript
initializeLMS();
```
below line 5. Also, add a function
```
window.onunload = function() {
  finishLMS();
}
```
below `window.onload` function. Finally, modify your `exit` function to look like this:
```javascript
function exit(){
  finishLMS();
  alert("Bye!");
}
```

Thus you just created a SCORM compatible course which can run on any SCORM 1.2 compatible LMS. Now, package this course as a zip file using any file compression utility.

**Note:** When packaging the course, always remember to keep `imamanifest.xml` file at the root directory, otherwise that course will not work on any LMS.

Upload it to the moodle setup we did in Chapter 1, and voila... it runs perfectly fine. You can check if it encountered any errors by referring to _Web Inspector -> Console_ or equivalent of your preferred browser. 


###Lesson 5: Scoring and Bookmarking

Now that we are done with a basic SCORM course, let's do something interesting. I will be listing 2 objectives for this lesson.

1. Set grade based on pages visited
2. Bookmark the last visited page

To complete first objective, my logical sequence of steps for solution are 
```
1. Define an array "visited" whose length will be equal to mKey length, where mKey tracks each module.
2. For every page visited, mark that index of "visited" array to true.
3. When user exits course, compute score by formula
	visitedCount/mKey.length * 100
4. Save that to LMS by setting "cmi.core.score.raw" value to that score.
```

You can use the same approach or devise your own solution. 

Second objective is relatively easy, and we have already seen it in Golf course in Chapter 1. Logical sequence of steps for achieving this are:
```
1. When user exits a course, set "cmi.core.lesson_location" value as the page from which the user left.
2. When user resumes a course, fetch value of "cmi.core.lesson_location" from LMS and display that page. 
```

If you get stuck, you can refer **finished** version inside Chapter 3 Lesson 5. Once done, upload that course to your Moodle installation and relish the joy of seeing your first fully functional SCORM compatible course in action. 


##Final Thoughts

Now that you have a solid understanding of SCORM, you can venture in your own adventures making e-learning courses. I hope you enjoyed learning SCORM using this course as much as I enjoyed making this. If you have any queries or you are facing any problems with your e-learning solution, feel free to contact me at abhi9bakshi@gmail.com. If you are interested in e-learning solutions, please visit [www.zealium.com](www.zealium.com) to check out our existing e-learning solutions as well as to get a quote for your next e-learning solution.
