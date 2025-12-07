import cv2

path = r"C:\Users\admin\Desktop\JD\Proyecto_Mina\Proyecto_Web\data\DDD\Non_Drowsy\zc1700.png"

print("Leyendo:", path)
img = cv2.imread(path)

print("Resultado:", img is not None)
if img is not None:
    print("Shape:", img.shape)
