import { Button } from "@chakra-ui/button"
import { useDisclosure } from "@chakra-ui/hooks"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal"
import {
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  Alert,
  AlertIcon,
  Input,
  Spinner,
  useToast,
} from "@chakra-ui/react"
import { useState, useEffect, Fragment } from "react"
import { useStorageContext } from "./hook/useStorageContext"
import { storageAddress } from "./contract/Storage"
import { useWeb3 } from "web3-hooks"

const Dapp = () => {
  const [web3State, login] = useWeb3()
  const storage = useStorageContext()

  const [value, setValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const toast = useToast()
  const {
    isOpen: isOpenLogoutModal,
    onOpen: onOpenLogoutModal,
    onClose: onCloseLogoutModal,
  } = useDisclosure()

  // Get storage value when component is mounted
  useEffect(() => {
    if (storage) {
      const getValue = async () => {
        try {
          const value = await storage.getData()
          setValue(value)
        } catch (e) {
          console.log(e)
        }
      }
      getValue()
    }
  }, [storage])

  const handleClickLogin = () => {
    if (!web3State.isLogged) {
      login()
    } else {
    }
  }

  const handleClickSetStorage = async () => {
    try {
      setIsLoading(true)
      let tx = await storage.setData(inputValue)
      await tx.wait()
      toast({
        title: "Confirmed transaction",
        description: `storage is set wiht value: ${inputValue}\nTransaction hash: ${tx.hash}`,
        status: "success",
        duration: 9000,
        isClosable: true,
      })
    } catch (e) {
      if (e.code === 4001) {
        toast({
          title: "Transaction signature denied",
          description: e.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        })
      }
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Fragment>
      <Modal isOpen={isOpenLogoutModal} onClose={onCloseLogoutModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logout from a Dapp</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>You can not logout from a Dapp.</Text>
            <Text>
              Disconnect your MetaMask from this website if you want to logout.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="pink" onClick={onCloseLogoutModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex flexDirection="column" alignItems="center" m={4} h="300px">
        <Flex
          justifyContent="space-between"
          width="100%"
          mb={4}
          alignItems="center"
        >
          <Heading size="xl">Storage</Heading>
          <Button
            colorScheme="pink"
            onClick={() =>
              !web3State.isLogged ? handleClickLogin() : onOpenLogoutModal()
            }
          >
            {!web3State.isLogged ? "Log in" : "Log out"}
          </Button>
        </Flex>
        <Heading size="xs" as="small" alignSelf="flex-start">
          Deployed on BSC Testnet at {storageAddress}
        </Heading>
        <Spacer />
        {!storage ? (
          <Spinner
            size="xl"
            label="Connecting to BSC"
            color="pink.500"
            emptyColor="pink.200"
          />
        ) : (
          <>
            {web3State.chainId === 97 ? (
              <>
                <Heading as="p" fontSize="30">
                  value: {value}
                </Heading>
                <HStack m={4}>
                  <Input
                    width="50"
                    value={inputValue}
                    placeholder="storage value to set"
                    onChange={(event) => setInputValue(event.target.value)}
                  />
                  <Button
                    isLoading={isLoading}
                    loadingText="setting storage"
                    colorScheme="pink"
                    onClick={handleClickSetStorage}
                  >
                    set storage
                  </Button>
                </HStack>
              </>
            ) : (
              <Alert status="error">
                <AlertIcon />
                You are on the wrong network, please connect to BSC Testnet
              </Alert>
            )}
          </>
        )}
      </Flex>
    </Fragment>
  )
}
export default Dapp
