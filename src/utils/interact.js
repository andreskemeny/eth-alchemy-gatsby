// require("dotenv").config();

const alchemyKey = process.env.ALCHEMY_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require("../../contract-abi.json");
const contractAddress = process.env.CONTRACT_ADDRESS;

export const helloWorldContract = new web3.eth.Contract(contractABI, contractAddress);

export const loadCurrentMessage = async () => {
  const message = await helloWorldContract.methods.message().call();
  return message;
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥  Error: " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "🦊 You must install Metamask, a virtual Ethereum wallet in your browser."
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the button at the top.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "🦊 You must install Metamask, a virtual Ethereum wallet in your browser."
    };
  }
};

export const updateMessage = async (address, message) => {
  if (!window.ethereum || address === null || address.length === 0) {
    return {
      status:
        "💡 Connect your Metamask wallet to update the message on the blockchain.",
    };
  }

  if (message.trim() === "") {
    return {
      status: "❌ Your message cannot be an empty string.",
    };
  }

  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: helloWorldContract.methods.update(message).encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: "View the status of your transaction on Etherscan! TxHash: " + txHash,
    };
  } catch (error) {
    return {
      status: "😥 " + error.message,
    };
  }
};
