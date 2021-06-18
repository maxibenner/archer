import bpy
from mathutils import Vector
import os
import sys
import json
import requests
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud import storage

credentialJSON = "./scripts/fotura_creds.json"

os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=credentialJSON

#Get credentials from local json file
cred = credentials.Certificate(credentialJSON) 

#Initialize default app
default_app = firebase_admin.initialize_app(cred)

#Get references
firestore = firestore.client() #official API
storage_client = storage.Client()




#GET_PROJECT_DOC____________________________________________________________________#
def getProjectDoc(docId):

    #Get doc from Firestore
    doc = firestore.collection('pending').document('activeJobs').collection('renders').document(docId).get()

    return doc



#DOWNLOAD_MODEL_____________________________________________________________________#
def downloadGlb(doc, fileName):

    #Doc to dict
    dict = doc.to_dict()

    #sceneName = dict['render']['sceneName']
    userId = dict['user']
    projectName = dict['render']['projectName']
    sample = dict['render']['sample']

    #Get project id from creds.json
    with open(credentialJSON, 'r') as myfile:
        data=myfile.read()
    obj = json.loads(data)

    # Get product model
    bucket_name = "{}.appspot.com".format(str(obj['project_id']))
    destination_file_name = "./temp/{}.glb".format(fileName)

    # Check for sample 
    if sample == 'true':
        source_blob_name = "globalFiles/model.glb"
        print('sample')
    else:
        source_blob_name = "users/{0}/projects/{1}/modelFiles/model.glb".format(userId, projectName)
        print('regular')
    def download_blob(bucket_name, source_blob_name, destination_file_name):

        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(source_blob_name)
        blob.download_to_filename(destination_file_name)

    download_blob(bucket_name, source_blob_name, destination_file_name)

    print('downloaded')







#IMPORT_AND_SETUP_GLB_______________________________________________________________#
def importAndSetupGlb(fileName):
    #Name object
    objectName = 'model'

    #Get objects before import
    objects_before_import = [object for object in bpy.context.scene.objects]

    # Import model
    bpy.ops.import_scene.gltf(filepath='./temp/{}.glb'.format(fileName))

    #Get all objects after import
    objects_after_import = [object for object in bpy.context.scene.objects]

    #Get only newly imported objects
    imported_objects = list(set(objects_after_import)-set(objects_before_import))

    #Create imported object array
    blendObjects = []
    for o in imported_objects:
        blendObjects.append(o)

    # APPLY TRANSFORMATIONS TO ALL MODEL OBJECTS
    #Select all objects
    for o in blendObjects:
        o.select_set(True)
    #Apply
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    #Deselect everything
    bpy.ops.object.select_all(action='DESELECT')

    #JOIN MESHES
    #Get mesh objects
    MSH_OBJS = [m for m in blendObjects if m.type == 'MESH']
    for mesh in MSH_OBJS:
        #Select all mesh objects
        mesh.select_set(True)
        #Make one active
        bpy.context.view_layer.objects.active = mesh
    #Join objects
    bpy.ops.object.join()

    #DELETE SCRAP OBJECTS
    #Update current objects
    objects_after_import = [object for object in bpy.context.scene.objects]
    #Get product objects remaining after join
    imported_objects = list(set(objects_after_import)-set(objects_before_import))
    #Remove scrap pieces
    for scrap_piece in imported_objects:
        
        if scrap_piece.type == 'EMPTY':
            #Deselect all
            bpy.ops.object.select_all(action='DESELECT')
            #Select the object and delete it
            bpy.data.objects[scrap_piece.name].select_set(True)
            #Delete scraps (objects without volume)
            bpy.ops.object.delete()
            #Deselect all
            bpy.ops.object.select_all(action='DESELECT')
        else:
            #Rename mesh
            scrap_piece.name = objectName
            #Select mesh
            bpy.data.objects[objectName].select_set(True)
            #Deselect all
            bpy.ops.object.select_all(action='DESELECT')


    #NORMALIZE DIMENSIONS
    o = bpy.data.objects[objectName]
    #Get longest side
    maxSide = max(o.dimensions)
    #Scale object
    o.scale = (1/maxSide,1/maxSide,1/maxSide)
    #Raise object to touch the floor (workaround for strange behaviour of dimensions not updating after rescaling)
    #o.location[2] = 1/maxSide*o.dimensions[2]/2
    #Update scene
    bpy.context.view_layer.update()

    
    #POSITION MODEL AT CENTER
    o = bpy.context.object

    local_bbox_center = 0.125 * sum((Vector(b) for b in o.bound_box), Vector())
    global_bbox_center = o.matrix_world @ local_bbox_center

    #Set 3D cursor to center
    bpy.context.scene.cursor.location = global_bbox_center

    #Select mesh
    bpy.data.objects[objectName].select_set(True)

    #Set object origin to cursor
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')

    #Move object to 0,0,0
    o.location = (0,0,o.dimensions.z/2)


#CREATE_CAMERA___________________________________________________________________________#
def createCamera(dict, f):

    #Get location values
    cam_pos_x = dict['render']['camera']['position']['x']
    cam_pos_y = dict['render']['camera']['position']['y']
    cam_pos_z = dict['render']['camera']['position']['z']

    #Get rotation values
    cam_rot_x = dict['render']['camera']['rotation']['x']
    cam_rot_y = dict['render']['camera']['rotation']['y']
    cam_rot_z = dict['render']['camera']['rotation']['z']

    #Create Camera
    cam = bpy.data.cameras.new("camera")
    cam.lens = f

    #Create the first camera object
    cam_obj = bpy.data.objects.new("camera", cam)
    cam_obj.location = (cam_pos_x, cam_pos_y, cam_pos_z)
    cam_obj.rotation_euler = ((3.14159 * cam_rot_x / 180),(3.14159 * cam_rot_y / 180),(3.14159 * cam_rot_z / 180))
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj



#RENDER__________________________________________________________________________________#
def renderScene():
    print('render start') 
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.image_settings.color_mode = 'RGBA'
    bpy.context.scene.render.filepath = "./temp/render"

    #Set resolution based on env
    with open(credentialJSON, 'r') as myfile:
        data=myfile.read()
    obj = json.loads(data)

    if obj['project_id'] == 'fotura3d-dev':
        bpy.context.scene.render.resolution_percentage = 10
    else:
        bpy.context.scene.render.resolution_percentage = 100

    bpy.ops.render.render(write_still = 1)



#UPLOAD_UPDATE_Finalize__________________________________________________________________#
def uploadUpdateFinalize(doc):

    #Doc to dict
    dict = doc.to_dict()

    #Get project id from creds.json
    with open(credentialJSON, 'r') as myfile:
        data=myfile.read()
    obj = json.loads(data)

    #Get variables
    userId = dict['user']
    docId = doc.id
    projectName = dict['render']['projectName']

    #UPDATE FIRESTORE
    firestore.collection('pending').document('activeJobs').collection('renders').document(docId).delete()
    firestore.collection('users').document(userId).collection('renders').document(docId).update({'status': 'Completed'})

    #UPLOAD FILE
    bucket_name = "{}.appspot.com".format(str(obj['project_id']))
    source_file_name = "./temp/render.png"
    destination_blob_name = "users/{0}/projects/{1}/images/{2}.png".format(userId, projectName, docId)

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(source_file_name)

    print("File {} uploaded to {}. Moving on.".format(source_file_name, destination_blob_name))


    



#OTHER______________________________________________________________________________#
def srgb_to_linearrgb(c):
    if   c < 0:       return 0
    elif c < 0.04045: return c/12.92
    else:             return ((c+0.055)/1.055)**2.4

def hex_to_rgb(h,alpha=1):
    h = int(h,0)
    r = (h & 0xff0000) >> 16 
    g = (h & 0x00ff00) >> 8
    b = (h & 0x0000ff)
    return tuple([srgb_to_linearrgb(c/0xff) for c in (r,g,b)] + [alpha])