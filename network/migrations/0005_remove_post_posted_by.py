# Generated by Django 3.2.8 on 2021-10-11 22:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_auto_20211011_2255'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='posted_by',
        ),
    ]
