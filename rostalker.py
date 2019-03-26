import rospy
from std_msgs.msg import String
from threading import Thread


def start_talker():
    pub = rospy.Publisher('chatter', String, queue_size=10)
    rospy.init_node('talker', anonymous=True)
    rate = rospy.Rate(10)  # 10hz

    while not rospy.is_shutdown():
        hello_str = "hello world %s" % rospy.get_time()
        rospy.loginfo(hello_str)
        pub.publish(hello_str)
        rate.sleep()


def start():
    print("Starting talker on new thread")
    thread = Thread(target=start_talker, args=())
    thread.start()
    thread.join()
    print("Thread Finished")
