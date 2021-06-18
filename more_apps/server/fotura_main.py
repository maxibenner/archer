#! /usr/bin/python3

import subprocess
import os
import requests
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

###############SET#FOR#EACH#ENVIRONMENT###############################
#Blender, and folders "scripts" and "blendfiles" need to be in this directory
fileDir = "/home/benner/blender"
#fileDir = "/Applications/Blender.app/Contents/MacOS"
######################################################################



#Get paths
blenderPath = "{}/blender".format(fileDir)
credentialJSON = "{}/scripts/fotura_creds.json".format(fileDir)

#Set working directory
os.chdir('{}/scripts'.format(fileDir))

#print(os.getcwd())

#Cloud functions credential
cfc = 'h27d-29d3-4j0s-1kokv-f89d'

#Get project id from creds.json
with open(credentialJSON, 'r') as myfile:
    data=myfile.read()
credData = json.loads(data)

#Set working directory
os.chdir(fileDir)
print(os.getcwd())

#Set credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=credentialJSON
cred = credentials.Certificate(credentialJSON) 

#Initialize default app
default_app = firebase_admin.initialize_app(cred)

#References
firestore = firestore.client()

def processOrders():

    #Get pending renders from Firestore
    docs = firestore.collection('pending').document('activeJobs').collection('renders').stream()

    #Loop through documents
    for doc in docs:

        #Get first pending render
        dict = doc.to_dict()

        #Get render details
        sceneName = dict['render']['sceneName']
        docId = doc.id

        #Get Blender path
        blender = blenderPath

        #Launch Blender
        ecom = subprocess.Popen([blender,  "{}/blendfiles/{}.blend".format(fileDir, sceneName), "--background", "--python", "{}/scripts/fotura_{}.py".format(fileDir, sceneName), "--", docId, fileDir] )
        ecom.wait()

    #Re-check order queue   
    newdocs =  firestore.collection('pending').document('activeJobs').collection('renders').limit(1).stream()
    for doc in newdocs:
        print('Found new orders. Continuing process.')
        processOrders()

    #Shut down compute instance
    url = 'https://us-central1-{}.cloudfunctions.net/stopComputeEngine'.format(str(credData['project_id']))
    requests.post(url, data = {'credentials': cfc})

    return

#Check for startup script blocker
blockerDoc = firestore.collection('settings').document('blockers').get()
startupScriptActive = blockerDoc.to_dict()['startupScript']

if startupScriptActive == True:
    print('Startup script is active = {}'.format(startupScriptActive))
    processOrders()
else:
    print('Startup script is active = {}'.format(startupScriptActive)) 
