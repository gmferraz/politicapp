import * as Sentry from "@sentry/react-native"
import { Button } from "heroui-native"
import { Component, type ErrorInfo, type ReactNode } from "react"
import { Text, View } from "react-native"

type Props = { children: ReactNode }
type State = { falhou: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { falhou: false }

  static getDerivedStateFromError(): State {
    return { falhou: true }
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    Sentry.captureException(erro, { extra: { pilha: info.componentStack } })
  }

  render() {
    if (!this.state.falhou) return this.props.children

    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-8">
        <Text className="text-center text-lg font-semibold text-foreground">
          Alguma coisa quebrou por aqui
        </Text>
        <Text className="text-center text-sm text-muted-foreground">
          O erro foi registrado. Tente abrir a tela de novo.
        </Text>
        <Button onPress={() => this.setState({ falhou: false })}>
          Tentar de novo
        </Button>
      </View>
    )
  }
}
