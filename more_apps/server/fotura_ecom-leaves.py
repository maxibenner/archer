import sys
import bpy
import os

#Get variables from main.py
argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"
docId = argv[0]
fileDir = argv[1]


#Add search directory
sys.path.insert(1, "{}/scripts".format(fileDir))
import fotura_convenience


#Choose model name
modelName = "model"

#Get project doc
doc = fotura_convenience.getProjectDoc(docId)
dict = doc.to_dict()

#Download model
fotura_convenience.downloadGlb(doc, modelName)

#Setup model
fotura_convenience.importAndSetupGlb(modelName)





#______________________________________________SETUP_SCENE_______________________________________________________#
#Get Rotation values
prod_rot_w = dict['render']['products'][0]['rotation']['w']
prod_rot_x = dict['render']['products'][0]['rotation']['x']
prod_rot_y = dict['render']['products'][0]['rotation']['y']
prod_rot_z = dict['render']['products'][0]['rotation']['z']
#Set rotation values
bpy.context.object.rotation_quaternion = (prod_rot_w,prod_rot_x,prod_rot_y,prod_rot_z)

#Get location value
prod_pos_z = dict['render']['products'][0]['position']['y']
#Set location values
bpy.context.object.location.z = prod_pos_z

#CREATE CAMERA
fotura_convenience.createCamera(dict, 85)

#_______________________________________________________________________________________________________________#




#Render
fotura_convenience.renderScene()

#Upload and finalize
fotura_convenience.uploadUpdateFinalize(doc)

#Shut down Blender
bpy.ops.wm.quit_blender()



        

