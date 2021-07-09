import argparse
import datetime
import filecmp
import os
import shutil
from concurrent.futures import ThreadPoolExecutor

from utilities.send_request import send_request

cwd = os.getcwd()
image_dir = cwd + '/../images/'
expected_results_dir = cwd + '/test/images/expected-results/'
results_dir = cwd + '/test/images/results/'


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def send_multiple_requests(num_request):
    num_max_workers = 100
    images = []

    # loop through all the images and store their paths into an array
    for i, name in enumerate(os.listdir(image_dir)):
        if i == num_request:
            break
        images.append(name)

    # use multiple threads to process the requests
    with ThreadPoolExecutor(max_workers=num_max_workers) as executor:
        executor.map(lambda image: send_request(image, image_dir, results_dir), images)


def send_single_requests(num_request):
    # Iterate through all the images in your local folder
    for i, name in enumerate(os.listdir(image_dir)):
        if i == num_request:
            break
        send_request(name, image_dir, results_dir)


if __name__ == '__main__':
    start_time = datetime.datetime.now()
    print("# START")
    print(start_time)
    print("----------------------------")

    parser = argparse.ArgumentParser(description='Upload images')
    parser.add_argument('--bulk', nargs="?", const=True, help='send in bulk')
    parser.add_argument('--num_request', type=int, help='one image per request')
    args, leftovers = parser.parse_known_args()

    if os.path.exists(results_dir):
        shutil.rmtree(results_dir)

    os.mkdir(results_dir)

    if args.bulk is not None:
        send_multiple_requests(args.num_request)
    else:
        send_single_requests(args.num_request)

    end_time = datetime.datetime.now()
    print("----------------------------")
    print("# END")
    print(end_time)
    print("----------------------------")

    difference = end_time - start_time
    minutes, seconds = divmod(difference.days * (24 * 60 * 60) + difference.seconds, 60)

    print("# DELTA")
    print('{} minutes, {} seconds'.format(minutes, seconds))
    print("----------------------------")

    for i, name in enumerate(os.listdir(expected_results_dir)):
        if not name.startswith('.'):
            if os.path.exists(results_dir + name):
                same = filecmp.cmp(results_dir + name, expected_results_dir + name)
                if same:
                    print(bcolors.OKGREEN + u'\u2713' + " -> " + name + bcolors.ENDC)
                else:
                    print(bcolors.FAIL + "X -> " + name + bcolors.ENDC)
            else:
                print(bcolors.FAIL + "X -> " + name + bcolors.ENDC)
