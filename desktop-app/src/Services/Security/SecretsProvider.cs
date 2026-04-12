using System;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace QuantumTrader.Services
{
	public interface ISecretsProvider
	{
		string? Get(string key);
		string? Get(string key, string? defaultValue);
	}

	public class SecretsProvider : ISecretsProvider
	{
		private const int CRED_TYPE_GENERIC = 1;

		[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
		private struct CREDENTIAL
		{
			public int Flags;
			public int Type;
			public string TargetName;
			public string Comment;
			public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
			public int CredentialBlobSize;
			public IntPtr CredentialBlob;
			public int Persist;
			public int AttributeCount;
			public IntPtr Attributes;
			public string TargetAlias;
			public string UserName;
		}

		[DllImport("Advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
		private static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

		[DllImport("Advapi32.dll", SetLastError = true)]
		private static extern void CredFree([In] IntPtr cred);

		public string? Get(string key)
		{
			return Get(key, null);
		}

		public string? Get(string key, string? defaultValue)
		{
			// Try environment variable (supports __ for nested)
			var envKey = key.Replace(':', '_').Replace("__", "_");
			var envVal = Environment.GetEnvironmentVariable(envKey) ?? Environment.GetEnvironmentVariable(key.Replace(":", "__"));
			if (!string.IsNullOrWhiteSpace(envVal)) return envVal;

			// Try Windows Credential Manager generic credentials
			var cred = ReadCredential(key) ?? ReadCredential($"QuantumTrader/{key}");
			if (!string.IsNullOrEmpty(cred)) return cred;

			return defaultValue;
		}

		private static string? ReadCredential(string target)
		{
			try
			{
				if (!CredRead(target, CRED_TYPE_GENERIC, 0, out var credPtr))
				{
					var err = new Win32Exception(Marshal.GetLastWin32Error());
					return null;
				}
				try
				{
					var cred = Marshal.PtrToStructure<CREDENTIAL>(credPtr);
					if (cred.CredentialBlobSize <= 0 || cred.CredentialBlob == IntPtr.Zero) return null;
					var blob = new byte[cred.CredentialBlobSize];
					Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);
					var secret = System.Text.Encoding.Unicode.GetString(blob);
					return secret;
				}
				finally
				{
					CredFree(credPtr);
				}
			}
			catch
			{
				return null;
			}
		}
	}
}


