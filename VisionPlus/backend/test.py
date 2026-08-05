# test.py
# Standalone script to verify that OpenCV can connect to a DroidCam or
# IP Camera stream URL before integrating it with VisionPlus.
# Run with:  python test.py

import sys
import cv2


def main():
    # Step 1: Ask the user for the stream URL.
    # Example: http://192.168.1.15:4747/video
    url = input("Enter DroidCam URL: ").strip()

    if not url:
        print("No URL entered. Exiting.")
        sys.exit(1)

    # Step 2: Attempt to open the video stream using the provided URL.
    print("Trying to connect...")
    cap = cv2.VideoCapture(url)

    # Step 3: Check whether the stream opened successfully.
    opened = cap.isOpened()
    print(f"Opened: {opened}")

    if not opened:
        # Step 4: If connection failed, print a message and exit cleanly.
        print("Could not connect to stream.")
        cap.release()
        sys.exit(1)

    # Step 5: Stream is open — continuously read and display frames.
    print("Connected! Press ESC to close the window.")

    while True:
        # Read the next frame from the stream.
        ret, frame = cap.read()

        if not ret:
            # Frame could not be read — stream may have ended or dropped.
            print("Stream ended or frame could not be read.")
            break

        # Display the frame in a window titled "DroidCam Test".
        cv2.imshow("DroidCam Test", frame)

        # Step 6: Wait 1 ms for a key press.
        # If the user presses ESC (key code 27), break out of the loop.
        if cv2.waitKey(1) & 0xFF == 27:
            print("ESC pressed. Closing.")
            break

    # Step 7: Release the capture object and destroy all OpenCV windows.
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
