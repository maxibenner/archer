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

#CREATE CAMERA
fotura_convenience.createCamera(dict, 85)

#INSERT BACKGROUND
#Check for transparency
if (dict['render']['background']['transparent'] == True):
    #Delete background
    bpy.ops.object.select_all(action='DESELECT')
    bpy.data.objects['bg'].select_set(True)
    bpy.ops.object.delete()
    bpy.ops.object.select_all(action='DESELECT')
else:
    #Get background height
    bg_height = dict['render']['background']['position']['z']
    #Set height
    bpy.data.objects['bg'].location[2] = bg_height
    #Get Color
    bg_color = dict['render']['background']['color']
    #Select material
    bpy.context.object.active_material_index = 0
    #Set color
    bpy.data.objects['bg'].active_material.node_tree.nodes["Principled BSDF"].inputs[0].default_value = fotura_convenience.hex_to_rgb(bg_color)
#_______________________________________________________________________________________________________________#




#Render
fotura_convenience.renderScene()

#Upload and finalize
fotura_convenience.uploadUpdateFinalize(doc)

#Shut down Blender
bpy.ops.wm.quit_blender()



        

