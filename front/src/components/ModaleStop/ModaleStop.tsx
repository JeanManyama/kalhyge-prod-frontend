import type React from 'react'
import {
  ModalContent,
  ModalActions,
  Button,
  Header,
  Icon,
  Modal,
} from 'semantic-ui-react'

interface ModaleStopProps{
  stop : boolean;
  setStop : React.Dispatch<React.SetStateAction<boolean>>
  setStart : boolean;
}
function ModaleStop({stop, setStop}: ModaleStopProps) {


  return (
    <Modal
      basic
      onClose={() => setStop(false)}
      onOpen={() => setStop(true)}
      open={stop}
      size='small'
    
    >
      <Header icon>
      <Icon name="warning sign" />
        Arrêt de l'application
      </Header>
      <ModalContent>
        <p>
         Cette opération est irreversible, les données seront perdues voulez-vous continuer ?
        </p>
      </ModalContent>
      <ModalActions>
      <Icon name="warning sign" />
        <Button basic color='red' inverted onClick={() => setStop(false)}>
          <Icon name='remove' /> Non
        </Button>
        {/* <Button color='green' inverted onClick={()=>{ setStop(false); setStart=false}}>
          <Icon name='checkmark' /> Oui
        </Button> */}
      </ModalActions>
    </Modal>
  )
}

export default ModaleStop;