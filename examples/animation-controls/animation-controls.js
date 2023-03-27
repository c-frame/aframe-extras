
const animationNames = {
  attack: 'Armature|TRex_Attack',
  death: 'Armature|TRex_Death',
  idle: 'Armature|TRex_Idle',
  jump: 'Armature|TRex_Jump',
  run: 'Armature|TRex_Run',
  walk: 'Armature|TRex_Walk',
};

updateAnimationMixer = () => {

  const data = {}
  data.clip = 'none'
  Object.entries(animationNames).forEach((name) => {

    const el = document.getElementById(name[0])
    
    if (el.checked) {
      data.clip = name[1]
    }
  })

  const keys = ['duration',
                'clampWhenFinished',
                'crossFadeDuration',
                'loop',
                'repetitions',
                'timeScale',
                'startAt']
  keys.forEach((key) => {
    const el = document.getElementById(key)
    let value = el.value

    const type = AFRAME.components['animation-mixer'].schema[key].type

    if (type === 'number' && isNaN(value)) {
      return;
    }

    if (type === 'boolean') {
      value = el.checked    
    }
    
    data[key] = value
  })

  const target = document.getElementById('trex1')
  target.setAttribute('animation-mixer', data)
}

document.addEventListener('DOMContentLoaded', () => {

  const inputs = document.querySelectorAll('input, select')

  inputs.forEach((input) => {
    input.addEventListener('change', updateAnimationMixer)
    input.addEventListener('click', updateAnimationMixer)
  })

  updateAnimationMixer()
})
