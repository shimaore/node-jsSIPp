    should = require 'should'
    child_process = require 'child_process'

    describe 'FreeSwitch', ->
      freeswitch = require 'travis-freeswitch'
      before (done) ->
        @timeout 3000
        service = freeswitch.start '../test/freeswitch.xml'
        setTimeout done, 2000
      describe 'when loaded', ->
        it 'should handle the load', (done) ->
          thor = child_process.spawn 'bin/thor', [
            '--amount', 200
            '--concurrent', 100
            'ws://127.0.0.1:8060'
          ], stdio: 'ignore'
          thor.on 'exit', (code,signal) ->
            if code isnt 0
              throw new Error "Got code = #{code}, signal = #{signal}"
            done()
