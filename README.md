# motion2model
카메라로 캡쳐한 모션을 3D 오브젝트 상에서 구현합니다

# concept
사용자 모션에 따라 3D캐릭터의 동작이 실시간으로 변화시키는게 프로젝트의 목적입니다. TFJS의 estimatePoses를 기반으로 웹캠에서 랜드마크를 취득합니다. 이후 랜드마크 좌표를 ThreeJS 모델에 입혀줍니다. 

# install

```
npm install
```

```
npm run start
```
