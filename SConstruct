#
# Licensed to Cloudkick, Inc ('Cloudkick') under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# Cloudkick licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

EnsureSConsVersion(1, 1, 0)

import os
import re
from os.path import join as pjoin

opts = Variables('build.py')

env = Environment(options=opts,
                  ENV = os.environ.copy(),
                  tools=['default'])

conf = Configure(env, custom_tests = {})
conf.env['NODE'] = conf.env.WhereIs('node')
conf.env.AppendUnique(RPATH = conf.env.get('LIBPATH'))
env = conf.Finish()

Export("env")

source = SConscript("lib/SConscript")

env["JSLINT"] = "$NODE lib/extern/node-jslint/bin/jslint.js"
jslint = [env.Command(pjoin('.jslint/', str(x))+".jslint", x, ["$JSLINT $SOURCE || exit 0"]) for x in source]
env.AlwaysBuild(jslint)

env.Alias('jslint', jslint)

targets = []

env.Default(targets)
