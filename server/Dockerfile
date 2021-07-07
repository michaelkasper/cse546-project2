FROM public.ecr.aws/lambda/python:3.8

WORKDIR /app

RUN pip3 install qrcode
RUN pip3 install Pillow
RUN pip3 install requests_toolbelt


COPY lambda_function.py   .
CMD ["/app/lambda_function.lambda_handler"]
